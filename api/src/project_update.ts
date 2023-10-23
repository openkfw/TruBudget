import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as ProjectUpdate from "./service/domain/workflow/project_update";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    displayName?: string;
    description?: string;
    thumbnail?: string;
    additionalData?: object;
    tags?: string[];
  };
}

/**
 * Creates the swagger schema for the `/project.update` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Partially update a project. Only properties mentioned in the request body are touched, " +
        "others are not affected. The assigned user will be notified about the change.",
      tags: ["project"],
      summary: "Update a project",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: {
            type: "string",
            const: "1.0",
            example: "1.0",
            errorMessage: { const: "Invalid Api Version specified" },
          },
          data: {
            type: "object",
            required: ["projectId"],
            properties: {
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "d0e8c69eg298c87e3899119e025eff1f",
              },
              displayName: { type: "string", example: "townproject" },
              description: { type: "string", example: "A town should be built" },
              thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
              additionalData: { type: "object" },
              tags: {
                type: "array",
                items: { type: "string", example: "project1" },
              },
            },
          },
        },
        errorMessage: "Failed to update project",
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that updates projects
 */
interface Service {
  updateProject(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    requestData: ProjectUpdate.RequestData,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/project.update` route
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
    server.post(`${urlPrefix}/project.update`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const reqBody = request.body as RequestBodyV1;

      const { projectId } = reqBody.data;
      const reqData = {
        displayName: reqBody.data.displayName,
        description: reqBody.data.description,
        thumbnail: reqBody.data.thumbnail,
        additionalData: reqBody.data.additionalData,
        tags: reqBody.data.tags,
      };

      service
        .updateProject(ctx, user, projectId, reqData)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "project.update failed");
          }
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {},
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while updating Project");
          reply.status(code).send(body);
        });
    });
  });
}
