import { FastifyInstance } from "fastify";

import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { toUnixTimestampStr } from "./lib/datetime";
import { isNonemptyString } from "./lib/validation";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import { SubprojectTraceEvent } from "./service/domain/workflow/subproject_trace_event";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    schema: {
      description:
        "Retrieve all subprojects for a given project. Note that any " +
        "subprojects the user is not allowed to see are left out of the response.",
      tags: ["subproject"],
      summary: "List all subprojects of a given project",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
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
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "school" },
                          description: { type: "string", example: "school should be built" },
                          assignee: { type: "string", example: "aSmith" },
                          currency: { type: "string", example: "EUR" },
                          projectedBudgets: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                organization: { type: "string", example: "ACME" },
                                value: { type: "string", example: "1234" },
                                currencyCode: { type: "string", example: "EUR" },
                              },
                            },
                          },
                          additionalData: { type: "object", additionalProperties: true },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          required: ["entityId", "entityType", "businessEvent", "snapshot"],
                          properties: {
                            entityId: {
                              type: "string",
                              example: "d0e8c69eg298c87e3899119e025eff1f",
                            },
                            entityType: { type: "string", example: "subproject" },
                            businessEvent: {
                              type: "object",
                              required: ["type", "source", "time", "publisher"],
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
                              required: ["displayName"],
                              properties: {
                                displayName: { type: "string", example: "Build a town-subproject" },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
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

interface ExposedSubproject {
  log: SubprojectTraceEvent[];
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    status: "open" | "closed";
    displayName: string;
    description: string;
    assignee?: string;
    currency: string;
    projectedBudgets: Array<{
      organization: string;
      value: string;
      currencyCode: string;
    }>;
    additionalData: object;
  };
}

interface Service {
  listSubprojects(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
  ): Promise<Subproject.Subproject[]>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(`${urlPrefix}/subproject.list`, mkSwaggerSchema(server), (request, reply) => {
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

    service
      .listSubprojects(ctx, user, projectId)
      .then((subprojects: Subproject.Subproject[]) => {
        return subprojects.map(subproject => {
          return {
            log: subproject.log,
            allowedIntents: getAllowedIntents(
              [user.id].concat(user.groups),
              subproject.permissions,
            ),
            data: {
              id: subproject.id,
              creationUnixTs: toUnixTimestampStr(subproject.createdAt),
              status: subproject.status,
              displayName: subproject.displayName,
              description: subproject.description,
              assignee: subproject.assignee,
              currency: subproject.currency,
              projectedBudgets: subproject.projectedBudgets,
              additionalData: subproject.additionalData,
            },
          };
        });
      })
      .then((subprojects: ExposedSubproject[]) => {
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: {
            items: subprojects,
          },
        };
        reply.status(code).send(body);
      })
      .catch(err => {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      });
  });
}
