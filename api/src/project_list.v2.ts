import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { toUnixTimestampStr } from "./lib/datetime";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import { extractUser } from "./handlerUtils";
import { Pagination, paginate } from "./lib/pagination";
import { isNumber } from "./lib/validation";

const API_VERSION = "2.0";

/**
 * Creates the swagger schema for the `v2/project.list` endpoint
 * This is a comment.
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Retrieve all projects the user is allowed to see.",
      tags: ["project", "v2"],
      summary: "List all projects",
      security: [
        {
          bearerToken: [],
        },
      ],
      parameters: [
        {
          in: "query",
          name: "page",
          description: "The page number to retrieve",
          required: false,
          schema: { type: "integer", minimum: 1 },
        },
        {
          in: "query",
          name: "limit",
          description: "The number of items per page",
          required: false,
          schema: { type: "integer", minimum: 1 },
        },
        {
          in: "query",
          name: "sort",
          description: "The field to sort by",
          required: false,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "search",
          description: "The field to search by",
          required: false,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "sort",
          description: "The field to sort by",
          required: false,
          schema: { type: "string" },
        },
        {
          in: "query",
          name: "order",
          description: "The order to sort by",
          required: false,
          schema: {
            type: "string",
            enum: ["asc", "desc"],
          },
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          required: ["apiVersion", "data"],
          properties: {
            apiVersion: { type: "string", example: "2.0" },
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
                pagination: {
                  type: "object",
                  properties: {
                    totalRecords: { type: "integer", example: 100 },
                    limit: { type: "integer", example: 10 },
                    totalPages: { type: "integer", example: 10 },
                    currentPage: { type: "integer", example: 1 },
                    nextPage: {
                      type: "string",
                      example: "/v2/project.list?page=2",
                      nullable: true,
                    },
                    prevPage: { type: "string", example: null, nullable: true },
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

// tdo move elsewhere, list v1 uses it too
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
    tags: string[];
  };
}

// todo move interface to service because it's used also in project_list.ts
/**
 * Represents the service that lists projects
 */
interface Service {
  listProjects(ctx: Ctx, user: ServiceUser): Promise<Result.Type<Project.Project[]>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/v2/project.list` route
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
    server.get(`${urlPrefix}/v2/project.list`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };
      const query = request.query as {
        search?: string;
        page?: number; //string?
        limit?: number; //string?
      };
      const user = extractUser(request as AuthenticatedRequest);

      const mapToExposedProject = (project: Project.Project): ExposedProject => {
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
      };

      service
        .listProjects(ctx, user)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "/v2/project.list failed");
          }
          return result.map(mapToExposedProject);
        })
        .then((projects: ExposedProject[]): Array<ExposedProject> => {
          // todo sort
          return projects;
        })
        .then((projects: ExposedProject[]): Array<ExposedProject> => {
          if (query.search && query.search.length > 0) {
            const searchTerm = query.search.toLowerCase();
            return projects.filter(
              (project) =>
                project.data.displayName.toLowerCase().includes(searchTerm) ||
                project.data.tags.some((item) => item.toLowerCase().includes(searchTerm)),
            );
          } else return projects;
        })
        .then((projects: ExposedProject[]): [Array<ExposedProject>, Pagination] => {
          if (query.page && !isNumber(query.page)) {
            throw new VError(
              { name: "BadRequest" },
              "Invalid query parameters: page must be a number",
            );
          }
          if (query.limit && !isNumber(query.limit)) {
            throw new VError(
              { name: "BadRequest" },
              "Invalid query parameters: limit must be a number",
            );
          }
          return paginate<ExposedProject>("/v2/project.list", projects, query.page, query.limit);
        })
        .then((result) => {
          const [items, pagination] = result;

          const body = {
            apiVersion: API_VERSION,
            data: {
              items,
              pagination,
            },
          };
          reply.status(200).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err, API_VERSION);
          request.log.error({ err }, "Error while listing projects");
          reply.status(code).send(body);
        });
    });
  });
}
