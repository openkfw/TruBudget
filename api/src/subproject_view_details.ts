import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

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
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import WorkflowitemType from "./service/domain/workflowitem_types/types";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description: "Retrieve details about a specific subproject.",
      tags: ["subproject"],
      summary: "View details",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
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
                        validator: { type: "string", example: "aSmith" },
                        workflowitemType: { type: "string", example: "general" },
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
    },
  };
}

interface ExposedProject {
  id: string;
  displayName: string;
}

interface ExposedSubproject {
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    status: "open" | "closed";
    displayName: string;
    description: string;
    assignee?: string;
    validator?: string;
    workflowitemType?: WorkflowitemType;
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
    currency: string | null | undefined;
    displayName: string | null;
    exchangeRate: string | undefined | null;
    billingDate: string | undefined | null;
    dueDate: string | undefined | null;
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
    workflowitemType?: WorkflowitemType;
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
  ): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem[]>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
  };
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
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
        // Get project info
        const projectResult = await service.getProject(ctx, user, projectId);
        if (Result.isErr(projectResult)) {
          throw new VError(projectResult, "subproject.viewDetails failed");
        }
        const displayName = projectResult.displayName;
        const exposedProject: ExposedProject = {
          id: projectId,
          displayName,
        };

        // Get subproject info
        const subprojectResult = await service.getSubproject(ctx, user, projectId, subprojectId);
        if (Result.isErr(subprojectResult)) {
          throw new VError(subprojectResult, "subproject.viewDetails failed");
        }
        const subproject: Subproject.Subproject = subprojectResult;
        const exposedSubproject: ExposedSubproject = {
          allowedIntents: getAllowedIntents([user.id].concat(user.groups), subproject.permissions),
          data: {
            id: subproject.id,
            creationUnixTs: toUnixTimestampStr(subproject.createdAt),
            status: subproject.status,
            displayName: subproject.displayName,
            assignee: subproject.assignee,
            validator: subproject.validator,
            workflowitemType: subproject.workflowitemType,
            description: subproject.description,
            currency: subproject.currency,
            projectedBudgets: subproject.projectedBudgets,
            additionalData: subproject.additionalData,
          },
        };

        // Get info of workflowitems
        const workflowitemsResult = await service.getWorkflowitems(
          ctx,
          user,
          projectId,
          subprojectId,
        );
        if (Result.isErr(workflowitemsResult)) {
          throw new VError(workflowitemsResult, "subproject.viewDetails failed");
        }
        const workflowitems: ExposedWorkflowitem[] = workflowitemsResult.map((workflowitem) => ({
          allowedIntents: workflowitem.isRedacted
            ? []
            : getAllowedIntents([user.id].concat(user.groups), workflowitem.permissions),
          data: {
            id: workflowitem.id,
            creationUnixTs: toUnixTimestampStr(workflowitem.createdAt),
            displayName: workflowitem.displayName,
            exchangeRate: workflowitem.exchangeRate,
            currency: workflowitem.currency,
            billingDate: workflowitem.billingDate,
            dueDate: workflowitem.dueDate,
            amountType: workflowitem.amountType,
            description: workflowitem.description,
            status: workflowitem.status,
            assignee: workflowitem.assignee,
            documents: workflowitem.documents,
            amount: workflowitem.amount,
            additionalData: workflowitem.additionalData,
            workflowitemType: workflowitem.workflowitemType,
          },
        }));

        const data: ExposedSubprojectDetails = {
          parentProject: exposedProject,
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
