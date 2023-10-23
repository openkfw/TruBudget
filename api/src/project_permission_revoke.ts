import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import Intent, { projectIntents } from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
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
    identity: Identity;
    intent: Intent;
  };
}

/**
 * Creates the swagger schema for the `/project.intent.revokePermission` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Revoke a permission from a user. After this call has returned, the " +
        "user will no longer be able to execute the given intent.",
      tags: ["project"],
      summary: "Revoke a permission from a user or group",
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
            required: ["identity", "intent", "projectId"],
            properties: {
              identity: { type: "string", format: "safeIdFormat", example: "aSmith" },
              intent: {
                type: "string",
                enum: projectIntents,
                example: "project.intent.listPermissions",
              },
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "d0e8c69eg298c87e3899119e025eff1f",
              },
            },
          },
        },
        errorMessage: "Failed to revoke project permission",
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
 * Represents the service that revokes project permissions
 */
interface Service {
  revokeProjectPermission(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    revokee: Identity,
    intent: Intent,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/project.intent.revokePermission` route
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
    server.post(
      `${urlPrefix}/project.intent.revokePermission`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const { projectId, identity: revokee, intent } = (request.body as RequestBodyV1).data;

        service
          .revokeProjectPermission(ctx, user, projectId, revokee, intent)
          .then((result) => {
            if (Result.isErr(result)) {
              throw new VError(result, "project.intent.revokePermission failed");
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
            request.log.error({ err }, "Error while revoking project permission");
            reply.status(code).send(body);
          });
      },
    );
  });
}
