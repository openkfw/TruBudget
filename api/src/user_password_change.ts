import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema, safePasswordSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserChangePassword from "./service/domain/organization/user_password_change";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    userId: string;
    newPassword: string;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    userId: safeIdSchema.required(),
    newPassword: safePasswordSchema.required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

/**
 * Validates the request body of the http request
 *
 * @param body the request body
 * @returns the request body wrapped in a {@link Result.Type}. Contains either the object or an error
 */
function validateRequestBody(body: unknown): Result.Type<RequestBody> {
  const { error, value } = requestBodySchema.validate(body);
  return !error ? value : error;
}

/**
 * Creates the swagger schema for the `/user.changePassword` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Change a user's password",
      tags: ["user"],
      summary: "Change a user's password",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["userId", "newPassword"],
            properties: {
              userId: { type: "string", example: "aSmith" },
              newPassword: { type: "string", example: "123456" },
            },
          },
        },
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
 * Represents the service that changes the password of a user
 */
interface Service {
  changeUserPassword(
    ctx: Ctx,
    serviceUser: ServiceUser,
    issuerOrganization: string,
    requestData: UserChangePassword.RequestData,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/user.changePassword` route
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
    server.post(`${urlPrefix}/user.changePassword`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const serviceUser: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const bodyResult = validateRequestBody(request.body);
      const issuerOrganization: string = (request as AuthenticatedRequest).user.organization;

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(
          new VError(bodyResult, "failed to change users password"),
        );
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const data = bodyResult.data;
      const reqData = {
        userId: data.userId,
        newPassword: data.newPassword,
      };

      service
        .changeUserPassword(ctx, serviceUser, issuerOrganization, reqData)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "user.changePassword failed");
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
          request.log.error({ err }, "Error while changing user password");
          reply.status(code).send(body);
        });
    });
  });
}
