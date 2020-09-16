import { FastifyInstance, FastifyReply, RequestGenericInterface } from "fastify";
import Joi = require("joi");
import VError = require("verror");

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { businessEventSchema } from "./service/domain/business_event";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as History from "./service/domain/workflow/historyFilter";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import { SubprojectTraceEvent } from "./service/domain/workflow/subproject_trace_event";

const requestBodySchema = Joi.array().items({
  entityId: Joi.string().required(),
  entityType: Joi.valid("subproject").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});

function validateRequestBody(body: any): Result.Type<SubprojectTraceEvent[]> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

/**
 * If no filter option is provided the return value is undefined
 */
const createFilter = (
  reply: FastifyReply,
  publisher?: Identity,
  startAt?: string,
  endAt?: string,
  eventType?: string,
): History.Filter | undefined => {
  const noFilterSet = !publisher && !startAt && !endAt && !eventType;
  if (noFilterSet) return;

  if (publisher !== undefined) {
    if (!isNonemptyString(publisher)) {
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message: "if present, the query parameter `publisher` must be non-empty string",
        },
      });
    }
  }

  // ISO Timestamp example: 01.01.2020 or 2019-12-31T23:00:00.000Z
  if (startAt !== undefined) {
    const startAtDate = new Date(startAt);
    if (isNaN(startAtDate.getTime())) {
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message: "if present, the query parameter `startAt` must be a valid ISO timestamp",
        },
      });
    }
  }

  if (endAt !== undefined) {
    const endAtDate = new Date(endAt);
    if (isNaN(endAtDate.getTime())) {
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message: "if present, the query parameter `endAt` must be a valid ISO timestamp",
        },
      });
    }
  }

  if (eventType !== undefined) {
    if (!isNonemptyString(eventType)) {
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message: "if present, the query parameter `eventType` must be non-empty string",
        },
      });
    }
  }
  return {
    publisher,
    startAt,
    endAt,
    eventType,
    // Make typescript happy - noFilterSet condition exists
  } as History.Filter;
};

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description:
        "View the history of a given subproject (filtered by what the user is allowed to see).",
      tags: ["subproject"],
      summary: "View subproject history",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
            type: "string",
          },
          limit: {
            type: "string",
            description: "Limit to the number of events to return.",
          },
          offset: {
            type: "string",
            description:
              "The index of the first event; any events that follow" +
              "have happened after that first event. The `offset` may also " +
              "be negative. For example, an `offset` of `-10` with limit `10` requests " +
              "the 10 most recent events.",
          },
        },
      },
      security: [{ bearerToken: [] }],
      response: {
        200: {
          description: "changes related to the given subproject in chronological order",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                historyItemsCount: {
                  type: "number",
                  description:
                    "Total number of history items (greater or equal to the number of returned items)",
                  example: 10,
                },
                events: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      entityId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                      entityType: { type: "string", example: "subproject" },
                      businessEvent: {
                        type: "object",
                        additionalProperties: true,
                        properties: {
                          type: { type: "string" },
                          source: { type: "string" },
                          time: { type: "string" },
                          publisher: { type: "string" },
                        },
                        example: {
                          type: "subproject_closed",
                          source: "http",
                          time: "2018-09-05T13:37:25.775Z",
                          publisher: "jdoe",
                        },
                      },
                      snapshot: {
                        type: "object",
                        additionalProperties: true,
                        properties: {
                          displayName: { type: "string", example: "Build a town" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface Service {
  getSubprojectHistory(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    filter?: History.Filter,
  ): Promise<Result.Type<SubprojectTraceEvent[]>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
    offset?: string;
    limit?: string;
    startAt?: string;
    endAt?: string;
    publisher?: string;
    eventType?: string;
  };
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
    `${urlPrefix}/subproject.viewHistory.v2`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const projectId = request.query.projectId;
      if (!isNonemptyString(projectId)) {
        reply.status(404).send({
          apiVersion: "1.0",
          error: {
            code: 404,
            message: "required query parameter `projectId` not present (must be non-empty string)",
          },
        });
        return;
      }

      const subprojectId = request.query.subprojectId;
      if (!isNonemptyString(subprojectId)) {
        reply.status(404).send({
          apiVersion: "1.0",
          error: {
            code: 404,
            message:
              "required query parameter `subprojectId` not present (must be non-empty string)",
          },
        });
        return;
      }

      // Default: last created history event
      let offset: number = 0;
      if (request.query.offset !== undefined) {
        offset = parseInt(request.query.offset, 10);
        if (isNaN(offset)) {
          reply.status(400).send({
            apiVersion: "1.0",
            error: {
              code: 400,
              message: "if present, the query parameter `offset` must be an integer",
            },
          });
          return;
        }
      }

      // Default: no limit
      let limit: number | undefined;
      if (request.query.limit !== undefined) {
        limit = parseInt(request.query.limit, 10);
        if (isNaN(limit) || limit <= 0) {
          reply.status(400).send({
            apiVersion: "1.0",
            error: {
              code: 400,
              message: "if present, the query parameter `limit` must be a positive integer",
            },
          });
          return;
        }
      }

      const filter = createFilter(
        reply,
        request.query.publisher,
        request.query.startAt,
        request.query.endAt,
        request.query.eventType,
      );

      try {
        // Get all Events in subproject stream
        const eventsResult = await service.getSubprojectHistory(
          ctx,
          user,
          projectId,
          subprojectId,
          filter,
        );
        if (Result.isErr(eventsResult)) {
          throw new VError(eventsResult, "subproject.viewHistory failed");
        }

        const eventsResultVerified = validateRequestBody(eventsResult);
        if (Result.isErr(eventsResultVerified)) {
          throw new VError(eventsResultVerified, "subproject.viewHistory failed");
        }
        const events: SubprojectTraceEvent[] = eventsResultVerified;

        const offsetIndex = offset < 0 ? Math.max(0, events.length + offset) : offset;
        const slice = events.slice(
          offsetIndex,
          limit === undefined ? undefined : offsetIndex + limit,
        );

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: {
            historyItemsCount: events.length,
            events: slice,
          },
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
