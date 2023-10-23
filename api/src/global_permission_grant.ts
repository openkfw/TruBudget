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
import Joi = require("joi");
import { extractUser } from "./handlerUtils";

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    identity: Identity;
    intent: Intent;
  };
}

/**
 * Creates the swagger schema for the `/global.grantPermission` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Grant the right to execute a specific intent on the Global scope to a given user.",
      tags: ["global"],
      summary: "Grant a permission to a user",
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
            required: ["identity", "intent"],
            properties: {
              identity: {
                type: "string",
                format: "safeIdFormat",
                example: "aSmith",
              },
              intent: {
                type: "string",
                enum: globalIntents,
                example: "global.createProject",
              },
            },
          },
        },
        errorMessage: "Failed to grant global permission",
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
 * Interface representing the service that handles granting of global permissions
 */
interface Service {
  grantGlobalPermission(
    ctx: Ctx,
    user: ServiceUser,
    userOrganization: string,
    grantee: Identity,
    permission: Intent,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.grantPermission` route
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
      `${urlPrefix}/global.grantPermission`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const userOrganization = (request as AuthenticatedRequest).user.organization;

        const { identity: grantee, intent } = (request.body as RequestBodyV1).data;

        service
          .grantGlobalPermission(ctx, user, userOrganization, grantee, intent)
          .then((result) => {
            if (Result.isErr(result)) throw new VError(result, "global.grantPermission failed");
            const code = 200;
            const body = {
              apiVersion: "1.0",
              data: {},
            };
            reply.status(code).send(body);
          })
          .catch((err) => {
            const { code, body } = toHttpError(err);
            reply.status(code).send(body);
            request.log.error({ err }, "Error while granting global permission");
          });
      },
    );
  });
}
