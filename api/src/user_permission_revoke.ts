import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import Intent, { userIntents } from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserRecord from "./service/domain/organization/user_record";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    userId: UserRecord.Id;
    identity: Identity;
    intent: Intent;
  };
}

/**
 * Creates the swagger schema for the `/user.intent.revokePermission` endpoint
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
      tags: ["user"],
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
            required: ["identity", "intent", "userId"],
            properties: {
              identity: { type: "string", format: "safeIdFormat", example: "aSmith" },
              intent: {
                type: "string",
                enum: userIntents,
                example: "user.intent.listPermissions",
              },
              userId: { type: "string", format: "userRecordIdFormat", example: "aSmith" },
            },
          },
        },
        errorMessage: "Failed to revoke user permission",
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
 * Represents the service that revoke permissions from a user
 */
interface Service {
  revokeUserPermission(
    ctx: Ctx,
    revoker: ServiceUser,
    revokerOrganization: string,
    userId: UserRecord.Id,
    revokee: Identity,
    intent: Intent,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/user.intent.revokePermission` route
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
      `${urlPrefix}/user.intent.revokePermission`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const revoker: ServiceUser = {
          id: (request as AuthenticatedRequest).user.userId,
          groups: (request as AuthenticatedRequest).user.groups,
          address: (request as AuthenticatedRequest).user.address,
        };
        const revokerOrganization: string = (request as AuthenticatedRequest).user.organization;

        const { userId, identity: revokee, intent } = (request.body as RequestBodyV1).data;

        service
          .revokeUserPermission(ctx, revoker, revokerOrganization, userId, revokee, intent)
          .then((result) => {
            if (Result.isErr(result)) {
              throw new VError(result, "user.intent.revokePermission failed");
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
            request.log.error({ err }, "Error while revoking user permission");
            reply.status(code).send(body);
          });
      },
    );
  });
}
