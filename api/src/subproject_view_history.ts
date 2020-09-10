import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

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
    preValidation: [(server as any).authenticate],
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
  ): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem[]>>;
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

      try {
        // Get subproject log
        const subprojectResult = await service.getSubproject(ctx, user, projectId, subprojectId);
        if (Result.isErr(subprojectResult)) {
          throw new VError(subprojectResult, "subproject.viewHistory failed");
        }
        const subproject: Subproject.Subproject = subprojectResult;

        // Get log of workflowitems
        const workflowitemsResult = await service.getWorkflowitems(
          ctx,
          user,
          projectId,
          subprojectId,
        );
        if (Result.isErr(workflowitemsResult)) {
          throw new VError(workflowitemsResult, "subproject.viewHistory failed");
        }
        const workflowitems: Workflowitem.ScrubbedWorkflowitem[] = workflowitemsResult;

        // Concat logs of subproject and workflowitems and sort them
        const events: ExposedEvent[] = subproject.log;
        for (const workflowitem of workflowitems) {
          if (!workflowitem.isRedacted) {
            events.push(...workflowitem.log);
          }
        }
        events.sort(byEventTime);

        // Handle offset and limit
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
