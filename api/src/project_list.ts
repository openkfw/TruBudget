import { VError } from "verror";

import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { extractUser } from "./handlerUtils";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { toUnixTimestampStr } from "./lib/datetime";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import { AugmentedFastifyInstance } from "./types";

/**
 * Creates the swagger schema for the `/project.list` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Retrieve all projects the user is allowed to see.",
      tags: ["project"],
      summary: "List all projects",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          required: ["apiVersion", "data"],
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              required: ["items"],
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["data", "allowedIntents"],
                    properties: {
                      data: {
                        type: "object",
                        required: [
                          "id",
                          "creationUnixTs",
                          "status",
                          "displayName",
                          "description",
                          "projectedBudgets",
                        ],
                        properties: {
                          id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "Build a town-project" },
                          description: { type: "string", example: "A town should be built" },
                          assignee: { type: "string", example: "aSmith" },
                          thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                          additionalData: { type: "object", additionalProperties: true },
                          tags: { type: "array", items: { type: "string", example: "test" } },
                          projectedBudgets: {
                            type: "array",
                            items: {
                              type: "object",
                              required: ["organization", "value", "currencyCode"],
                              properties: {
                                organization: { type: "string", example: "ACME Corp." },
                                value: { type: "string", example: "1000000" },
                                currencyCode: { type: "string", example: "EUR" },
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
    additionalData?: object;
    projectedBudgets: Array<{
      organization: string;
      value: string;
      currencyCode: string;
    }>;
  };
}

/**
 * Represents the service that lists projects
 */
interface Service {
  listProjects(ctx: Ctx, user: ServiceUser): Promise<Result.Type<Project.Project[]>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/project.list` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
): void {
  server.register(async function () {
    server.get(`${urlPrefix}/project.list`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };
      const user = extractUser(request as AuthenticatedRequest);

      service
        .listProjects(ctx, user)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "project.list failed");
          }
          const projects = result;
          request.log.debug("Mapping intents and timestamp of projects");
          return projects.map((project) => {
            return {
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
          });
        })
        .then((projects: ExposedProject[]) => {
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              items: projects,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while listing projects");
          reply.status(code).send(body);
        });
    });
  });
}
