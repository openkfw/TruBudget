import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserEnable from "./service/domain/organization/user_enable";
import Joi = require("joi");

/**
 * Represents the request body of the endpoints
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    userId: string;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    userId: safeIdSchema.required(),
  }).required(),
});

/**
 * Creates the swagger schema for the `/global.enableUser` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Enable an user account",
      tags: ["user"],
      summary: "Enable an user account",
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
            required: ["userId"],
            properties: {
              userId: { type: "string", format: "safeIdFormat", example: "aSmith" },
            },
          },
        },
        errorMessage: "Failed to enable an user",
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
 * Represents the service that enables a user
 */
interface Service {
  enableUser(
    ctx: Ctx,
    issuer: ServiceUser,
    issuerOrganization: string,
    requestData: UserEnable.RequestData,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.enableUser` route
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
    server.post(`${urlPrefix}/global.enableUser`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const issuer: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };
      const issuerOrganization: string = (request as AuthenticatedRequest).user.organization;

      const revokee = {
        userId: (request.body as RequestBodyV1).data.userId,
      };

      service
        .enableUser(ctx, issuer, issuerOrganization, revokee)
        .then((result) => {
          if (Result.isErr(result)) throw new VError(result, "global.enableUser failed");
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {},
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while enabling user");
          reply.status(code).send(body);
        });
    });
  });
}
