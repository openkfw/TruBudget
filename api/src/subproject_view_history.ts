import { FastifyReply, FastifyRequest, RequestGenericInterface } from "fastify";
import { AugmentedFastifyInstance } from "types";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema, safeStringSchema } from "./lib/joiValidation";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { businessEventSchema } from "./service/domain/business_event";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as History from "./service/domain/workflow/historyFilter";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import { SubprojectTraceEvent } from "./service/domain/workflow/subproject_trace_event";
import Joi = require("joi");
import VError = require("verror");

const requestBodySchema = Joi.array().items({
  entityId: safeIdSchema.required(),
  entityType: Joi.valid("subproject").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: safeStringSchema.required(),
  }).required(),
});

/**
 * Validates the request body of the http request
 *
 * @param body the request body
 * @returns the request body wrapped in a {@link Result.Type}. Contains either the object or an error
 */
function validateRequestBody(body): Result.Type<SubprojectTraceEvent[]> {
  const { error, value } = requestBodySchema.validate(body);
  return !error ? value : error;
}

/**
 * If no filter option is provided the return value is undefined
 */
const createFilter = (reply: FastifyReply, request: FastifyRequest): History.Filter | undefined => {
  const { publisher, startAt, endAt, eventType } = request.query as Querystring;
  const noFilterSet = !publisher && !startAt && !endAt && !eventType;
  if (noFilterSet) return;

  if (publisher !== undefined) {
    if (!isNonemptyString(publisher)) {
      const message = "if present, the query parameter `publisher` must be non-empty string";
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message,
        },
      });
      request.log.error({ err: message }, "Invalid request body");
    }
  }

  // ISO Timestamp example: 01.01.2020 or 2019-12-31T23:00:00.000Z
  if (startAt !== undefined) {
    const startAtDate = new Date(startAt);
    if (isNaN(startAtDate.getTime())) {
      const message = "if present, the query parameter `startAt` must be a valid ISO timestamp";
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message,
        },
      });
      request.log.error({ err: message }, "Invalid request body");
    }
  }

  if (endAt !== undefined) {
    const endAtDate = new Date(endAt);
    if (isNaN(endAtDate.getTime())) {
      const message = "if present, the query parameter `endAt` must be a valid ISO timestamp";
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message,
        },
      });
      request.log.error({ err: message }, "Invalid request body");
    }
  }

  if (eventType !== undefined) {
    if (!isNonemptyString(eventType)) {
      const message = "if present, the query parameter `eventType` must be non-empty string";
      reply.status(400).send({
        apiVersion: "1.0",
        error: {
          code: 400,
          message,
        },
      });
      request.log.error({ err: message }, "Invalid request body");
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

/**
 * Creates the swagger schema for the `/subproject.viewHistory` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
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

interface Querystring extends RequestGenericInterface {
  projectId: string;
  subprojectId: string;
  offset?: string;
  limit?: string;
  startAt?: string;
  endAt?: string;
  publisher?: string;
  eventType?: string;
}

/**
 * Creates an http handler that handles incoming http requests for the `/subproject.viewHistory` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.get<{ Querystring: Querystring }>(
    `${urlPrefix}/subproject.viewHistory`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const projectId = request.query.projectId;
      if (!isNonemptyString(projectId)) {
        const message =
          "required query parameter `projectId` not present (must be non-empty string)";
        reply.status(404).send({
          apiVersion: "1.0",
          error: {
            code: 404,
            message,
          },
        });
        request.log.error({ err: message }, "Invalid request body");
        return;
      }

      const subprojectId = request.query.subprojectId;
      if (!isNonemptyString(subprojectId)) {
        const message =
          "required query parameter `subprojectId` not present (must be non-empty string)";
        reply.status(404).send({
          apiVersion: "1.0",
          error: {
            code: 404,
            message,
          },
        });
        request.log.error({ err: message }, "Invalid request body");
        return;
      }

      // Default: last created history event
      let offset: number = 0;
      if (request.query.offset !== undefined) {
        offset = parseInt(request.query.offset, 10);
        if (isNaN(offset)) {
          const message = "if present, the query parameter `offset` must be an integer";
          reply.status(400).send({
            apiVersion: "1.0",
            error: {
              code: 400,
              message,
            },
          });
          request.log.error({ err: message }, "Invalid request body");
          return;
        }
      }

      // Default: no limit
      let limit: number | undefined;
      if (request.query.limit !== undefined) {
        limit = parseInt(request.query.limit, 10);
        if (isNaN(limit) || limit <= 0) {
          const message = "if present, the query parameter `limit` must be a positive integer";
          reply.status(400).send({
            apiVersion: "1.0",
            error: {
              code: 400,
              message,
            },
          });
          request.log.error({ err: message }, "Invalid request body");
          return;
        }
      }

      const filter = createFilter(reply, request);

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
        request.log.error({ err }, "Error while viewing subproject history");
        reply.status(code).send(body);
      }
    },
  );
}
