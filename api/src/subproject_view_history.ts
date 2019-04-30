import { FastifyInstance } from "fastify";
import Joi = require("joi");

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { BusinessEvent } from "./service/domain/business_event";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    schema: {
      deprecated: true,
      description:
        "View the history of a given project (filtered by what the user is allowed to see).",
      tags: ["subproject"],
      summary: "View history",
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
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
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
                          displayName: { type: "string", example: "townproject" },
                        },
                      },
                    },
                  },
                },
                historyItemsCount: {
                  type: "number",
                  example: 10,
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

interface ExposedEvent {
  entityId: string;
  entityType: "subproject" | "workflowitem";
  businessEvent: BusinessEvent;
  snapshot: {
    displayName?: string;
  };
}

interface Service {
  getSubproject(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getWorkflowitems(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Workflowitem.ScrubbedWorkflowitem[]>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(
    `${urlPrefix}/subproject.viewHistory`,
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

      const offset = parseInt(request.query.offset || 0, 10);
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

      let limit: number | undefined = parseInt(request.query.limit, 10);
      if (isNaN(limit)) {
        limit = undefined;
      } else if (limit <= 0) {
        reply.status(400).send({
          apiVersion: "1.0",
          error: {
            code: 400,
            message: "if present, the query parameter `limit` must be a positive integer",
          },
        });
        return;
      }

      try {
        const subprojectResult = await service.getSubproject(ctx, user, projectId, subprojectId);
        if (Result.isErr(subprojectResult)) {
          subprojectResult.message = `subproject.viewHistory failed: ${subprojectResult.message}`;
          throw subprojectResult;
        }
        const subproject: Subproject.Subproject = subprojectResult;
        // Add subprojects' logs to the project log and sort by creation time:
        const workflowitemsResult = await service.getWorkflowitems(
          ctx,
          user,
          projectId,
          subprojectId,
        );
        // TODO: Uncomment if Result.Type<Workflowitem.Workflowitem[]>> is used
        // if (Result.isErr(workflowitemsResult)) {
        //   workflowitemsResult.message = `subproject.viewHistory failed: ${
        //     workflowitemsResult.message
        //   }`;
        //   throw workflowitemsResult;
        // }
        const workflowitems: Workflowitem.ScrubbedWorkflowitem[] = workflowitemsResult;

        const events: ExposedEvent[] = subproject.log;
        for (const workflowitem of workflowitems) {
          if (!workflowitem.isRedacted) {
            events.push(...workflowitem.log);
          }
        }

        events.sort(byEventTime);

        const offsetIndex = offset < 0 ? Math.max(0, events.length + offset) : offset;
        const slice = events.slice(
          offsetIndex,
          limit === undefined ? undefined : offsetIndex + limit,
        );

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: {
            events: slice,
            historyItemsCount: events.length,
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

function byEventTime(a: ExposedEvent, b: ExposedEvent): -1 | 0 | 1 {
  const timeA = new Date(a.businessEvent.time);
  const timeB = new Date(b.businessEvent.time);
  if (timeA < timeB) return -1;
  if (timeA > timeB) return 1;
  return 0;
}
