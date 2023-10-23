import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import Intent, { globalIntents } from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";
import { extractUser } from "./handlerUtils";
import {
  GlobalPermissions,
  identitiesAuthorizedFor,
} from "./service/domain/workflow/global_permissions";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    identity: Identity;
  };
}

/**
 * Creates the swagger schema for the `/global.grantAllPermissions` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Grant all available permissions to a user. Useful as a shorthand for creating admin users.",
      tags: ["global"],
      summary: "Grant all permission to a group or user",
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
            required: ["identity"],
            properties: {
              identity: {
                type: "string",
                format: "safeIdFormat",
                example: "aSmith",
              },
            },
          },
        },
        errorMessage: "Failed to grant all global permissions",
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: { type: "object" },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Interface representing the service that handles granting of all global permissions
 */
interface Service {
  getGlobalPermissions(ctx: Ctx, user: ServiceUser): Promise<Result.Type<GlobalPermissions>>;
  grantGlobalPermissions(
    ctx: Ctx,
    user: ServiceUser,
    userOrganization: string,
    grantee: Identity,
    permission: Intent,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.grantAllPermissions` route
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
      `${urlPrefix}/global.grantAllPermissions`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const userOrganization: string = (request as AuthenticatedRequest).user.organization;

        const { identity: grantee } = (request.body as RequestBodyV1).data;

        try {
          const globalPermissionsResult = await service.getGlobalPermissions(ctx, user);
          if (Result.isErr(globalPermissionsResult)) {
            throw new VError(globalPermissionsResult, "get global permissions failed");
          }
          const globalPermissions = globalPermissionsResult;
          for (const intent of globalIntents) {
            // A quick check to see if the user is already listed explicitly. In case the
            // user is authorized through her membership in an authorized group, the user
            // ID is still added.
            if (identitiesAuthorizedFor(globalPermissions, intent).includes(user.id)) {
              continue;
            }
            const result = await service.grantGlobalPermissions(
              ctx,
              user,
              userOrganization,
              grantee,
              intent,
            );
            if (Result.isErr(result)) throw new VError(result, "global.grantAllPermissions failed");
            request.log.debug({ grantee, intent }, "permission granted");
          }

          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {},
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while granting all global permissions");
          reply.status(code).send(body);
        }
      },
    );
  });
}
