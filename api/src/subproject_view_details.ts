import { FastifyInstance } from "fastify";

import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { toUnixTimestampStr } from "./lib/datetime";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import { SubprojectTraceEvent } from "./service/domain/workflow/subproject_trace_event";
import * as Workflowitem from "./service/domain/workflow/workflowitem";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    description: "Retrieve details about a specific subproject.",
    tags: ["subproject"],
    summary: "View details",
    querystring: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          example: "d0e8c69eg298c87e3899119e025eff1f",
        },
        subprojectId: {
          type: "string",
          example: "rfe8er9eg298c87e3899119e025eff1f",
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
              parentProject: {
                type: "object",
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  displayName: { type: "string", example: "townproject" },
                },
              },
              subproject: {
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
                      currency: {
                        type: "string",
                        description: "contract currency",
                        example: "EUR",
                      },
                      projectedBudgets: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            organization: { type: "string", example: "MyOrga" },
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
                      properties: {
                        key: { type: "string" },
                        intent: { type: "string", example: "global.createProject" },
                        createdBy: { type: "string", example: "aSmith" },
                        createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                        dataVersion: { type: "string", example: "1" },
                        data: {
                          type: "object",
                          properties: {
                            subproject: {
                              type: "object",
                              properties: {
                                id: {
                                  type: "string",
                                  example: "d0e8c69eg298c87e3899119e025eff1f",
                                },
                                creationUnixTs: { type: "string", example: "1536154645775" },
                                status: { type: "string", example: "open" },
                                displayName: { type: "string", example: "school" },
                                description: {
                                  type: "string",
                                  example: "school should be built",
                                },
                                billingDate: {
                                  type: "string",
                                  example: "2018-12-11T00:00:00.000Z",
                                },
                                exchangeRate: { type: "string", example: "1.0" },
                                assignee: { type: "string", example: "aSmith" },
                                currency: { type: "string", example: "EUR" },
                                projectedBudgets: {
                                  type: "array",
                                  items: {
                                    type: "object",
                                    properties: {
                                      organization: { type: "string", example: "MyOrga" },
                                      value: { type: "string", example: "1234" },
                                      currencyCode: { type: "string", example: "EUR" },
                                    },
                                  },
                                },
                                thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                              },
                            },
                            permissions: {
                              type: "object",
                              additionalProperties: true,
                              example: {
                                "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                              },
                            },
                            snapshot: {
                              type: "object",
                              properties: {
                                displayName: { type: "string", example: "school" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  allowedIntents: { type: "array", items: { type: "string" } },
                },
              },
              workflowitems: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: true,
                  example: { myWorkflowItems: {} },
                },
              },
            },
          },
        },
      },
      401: NotAuthenticated.schema,
    },
  };
}

interface ExposedProject {
  id: string;
  displayName: string;
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

interface ExposedWorkflowitem {
  data: {
    id: string;
    creationUnixTs: string;
    displayName: string | null;
    exchangeRate: string | undefined | null;
    billingDate: string | undefined | null;
    amountType: string | null;
    description: string | null;
    status: string;
    assignee: string | undefined | null;
    documents: Array<{
      id: string;
      hash: string;
    }> | null;
    amount?: string | null;
    additionalData: object | null;
  };
  allowedIntents: Intent[];
}

interface ExposedSubprojectDetails {
  parentProject: ExposedProject;
  subproject: ExposedSubproject;
  workflowitems: ExposedWorkflowitem[];
}

interface Service {
  getProject(ctx: Ctx, user: ServiceUser, projectId: string): Promise<Result.Type<Project.Project>>;
  getSubproject(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getWorkflowitems(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
  ): Promise<Workflowitem.ScrubbedWorkflowitem[]>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(
    `${urlPrefix}/subproject.viewDetails`,
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

      try {
        const subprojectResult = await service.getSubproject(ctx, user, projectId, subprojectId);
        if (Result.isErr(subprojectResult)) {
          subprojectResult.message = `subproject.viewDetails failed: ${subprojectResult.message}`;
          throw subprojectResult;
        }
        const subproject: Subproject.Subproject = subprojectResult;

        const exposedSubproject: ExposedSubproject = {
          log: subproject.log,
          allowedIntents: getAllowedIntents([user.id].concat(user.groups), subproject.permissions),
          data: {
            id: subproject.id,
            creationUnixTs: toUnixTimestampStr(subproject.createdAt),
            status: subproject.status,
            displayName: subproject.displayName,
            assignee: subproject.assignee,
            description: subproject.description,
            currency: subproject.currency,
            projectedBudgets: subproject.projectedBudgets,
            additionalData: subproject.additionalData,
          },
        };

        const projectResult = await service.getProject(ctx, user, projectId);
        if (Result.isErr(projectResult)) {
          projectResult.message = `subproject.viewDetails failed: ${projectResult.message}`;
          throw projectResult;
        }

        const project: Project.Project = projectResult;

        const parentProject: ExposedProject = {
          id: project.id,
          displayName: project.displayName,
        };

        const workflowitemsResult = await service.getWorkflowitems(
          ctx,
          user,
          projectId,
          subprojectId,
        );
        if (Result.isErr(workflowitemsResult)) {
          workflowitemsResult.message = `subproject.viewDetails failed: ${
            workflowitemsResult.message
          }`;
          throw workflowitemsResult;
        }

        const workflowitems: ExposedWorkflowitem[] = workflowitemsResult.map(workflowitem => ({
          allowedIntents: workflowitem.isRedacted
            ? []
            : getAllowedIntents([user.id].concat(user.groups), workflowitem.permissions),
          data: {
            id: workflowitem.id,
            creationUnixTs: toUnixTimestampStr(workflowitem.createdAt),
            displayName: workflowitem.displayName,
            exchangeRate: workflowitem.exchangeRate,
            billingDate: workflowitem.billingDate,
            amountType: workflowitem.amountType,
            description: workflowitem.description,
            status: workflowitem.status,
            assignee: workflowitem.assignee,
            documents: workflowitem.documents,
            amount: workflowitem.amount,
            additionalData: workflowitem.additionalData,
          },
        }));

        const data: ExposedSubprojectDetails = {
          parentProject,
          subproject: exposedSubproject,
          workflowitems,
        };

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data,
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
