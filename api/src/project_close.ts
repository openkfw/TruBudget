import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
  };
}

/**
 * Creates the swagger schema for the `/project.close`` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Set a project's status to 'closed' if, and only if, all associated " +
        "subprojects are already set to 'closed'.",
      tags: ["project"],
      summary: "Close a project",
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
            },
          },
        },
        errorMessage: "Failed to close project",
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
 * Represents the service that closes a project
 */
interface Service {
  closeProject(ctx: Ctx, user: ServiceUser, projectId: Project.Id): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/project.close`` route
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
    server.post(`${urlPrefix}/project.close`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const { projectId } = (request.body as RequestBodyV1).data;

      service
        .closeProject(ctx, user, projectId)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "project.close failed");
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
          request.log.error({ err }, "Error while closing project");
          reply.status(code).send(body);
        });
    });
  });
}
