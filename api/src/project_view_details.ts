import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

import WorkflowitemType from "./service/domain/workflowitem_types/types";
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

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description: "Retrieve details about a specific project.",
      tags: ["project"],
      summary: "View details",
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
                project: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                        creationUnixTs: { type: "string", example: "1536154645775" },
                        status: { type: "string", example: "open" },
                        displayName: { type: "string", example: "Build a town-project" },
                        description: { type: "string", example: "A town should be built" },
                        assignee: { type: "string", example: "aSmith" },
                        validator: { type: "string", example: "aSmith" },
                        workflowitemType: { type: "string", example: "general" },
                        thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                        tags: {
                          type: "array",
                          items: { type: "string", example: "/Thumbnail_0001.jpg" },
                        },
                        projectedBudgets: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              organization: { type: "string", example: "ACME Corp." },
                              value: { type: "string", example: "1000000" },
                              currencyCode: { type: "string", example: "EUR" },
                            },
                          },
                        },
                        additionalData: {
                          type: "object",
                          additionalProperties: true,
                        },
                      },
                    },
                    allowedIntents: { type: "array", items: { type: "string" } },
                  },
                },
                subprojects: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: true,
                    example: { mySubproject: {} },
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
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    status: "open" | "closed";
    displayName: string;
    description: string;
    assignee?: string;
    thumbnail?: string;
    projectedBudgets: Array<{
      organization: string;
      value: string;
      currencyCode: string;
    }>;
    additionalData: object;
    tags?: string[];
  };
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
    WorkflowitemType?: WorkflowitemType;
    currency: string;
    projectedBudgets: Array<{
      organization: string;
      value: string;
      currencyCode: string;
    }>;
    additionalData: object;
  };
}

interface ExposedProjectDetails {
  project: ExposedProject;
  subprojects: ExposedSubproject[];
}

interface Service {
  getProject(ctx: Ctx, user: ServiceUser, projectId: string): Promise<Result.Type<Project.Project>>;
  getSubprojects(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
  ): Promise<Result.Type<Subproject.Subproject[]>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
  };
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
    `${urlPrefix}/project.viewDetails`,
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

      try {
        const projectResult = await service.getProject(ctx, user, projectId);
        if (Result.isErr(projectResult)) {
          throw new VError(projectResult, "project.viewDetails failed");
        }
        const project: Project.Project = projectResult;

        const exposedProject: ExposedProject = {
          allowedIntents: getAllowedIntents([user.id].concat(user.groups), project.permissions),
          data: {
            id: project.id,
            creationUnixTs: toUnixTimestampStr(project.createdAt),
            status: project.status,
            displayName: project.displayName,
            assignee: project.assignee,
            description: project.description,
            thumbnail: project.thumbnail,
            projectedBudgets: project.projectedBudgets,
            additionalData: project.additionalData,
            tags: project.tags,
          },
        };

        const subprojectsResult = await service.getSubprojects(ctx, user, projectId);
        if (Result.isErr(subprojectsResult)) {
          throw new VError(subprojectsResult, "project.viewDetails failed");
        }
        const subprojects: Subproject.Subproject[] = subprojectsResult;

        const exposedSubprojects: ExposedSubproject[] = subprojects.map((subproject) => ({
          allowedIntents: getAllowedIntents([user.id].concat(user.groups), subproject.permissions),
          data: {
            id: subproject.id,
            creationUnixTs: toUnixTimestampStr(subproject.createdAt),
            status: subproject.status,
            displayName: subproject.displayName,
            description: subproject.description,
            assignee: subproject.assignee,
            validator: subproject.validator,
            workflowitemType: subproject.workflowitemType,
            currency: subproject.currency,
            projectedBudgets: subproject.projectedBudgets,
            additionalData: subproject.additionalData,
          },
        }));

        const data: ExposedProjectDetails = {
          project: exposedProject,
          subprojects: exposedSubprojects,
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
