import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { verify } from "jsonwebtoken";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema, safePasswordSchema } from "./lib/joiValidation";
import { Type, isErr } from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { RequestData } from "./service/domain/organization/user_password_change";
import Joi = require("joi");
import { JwtConfig } from "config";

const API_VERSION = "1.0";

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
 * @returns the request body wrapped in a {@link Type}. Contains either the object or an error
 */
function validateRequestBody(body: unknown): Type<RequestBody> {
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
      description: "Reset users password",
      tags: ["user"],
      summary: "Reset users password",
      security: [
        {
          bearerToken: {
            type: "apiKey",
            description: "Authorization token",
            name: "Authorization",
            in: "header",
          },
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
    issuerOrganization: string | null,
    requestData: RequestData,
  ): Promise<Type<void>>;
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
  jwt: JwtConfig,
): void {
  server.register(async function () {
    server.post(`${urlPrefix}/user.resetPassword`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };
      const token = request.headers.authorization?.substring(7) as string;
      const secretOrPrivateKey =
        jwt.algorithm === "RS256"
          ? Buffer.from(jwt.secretOrPrivateKey, "base64")
          : jwt.secretOrPrivateKey;
      verify(token, secretOrPrivateKey, {
        algorithms: [jwt.algorithm],
      });

      const bodyResult = validateRequestBody(request.body);

      if (isErr(bodyResult)) {
        const { code, body } = toHttpError(
          new VError(bodyResult, "failed to reset users password"),
        );
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const data = bodyResult.data;
      const { userId } = data;

      const serviceUser: ServiceUser = {
        id: userId,
        groups: [""],
        address: "",
      };
      const issuerOrganization = null;

      service
        .changeUserPassword(ctx, serviceUser, issuerOrganization, data)
        .then((result) => {
          if (isErr(result)) {
            throw new VError(result, "user.resetPassword failed");
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
          request.log.error({ err }, "Error while reseting user password");
          reply.status(code).send(body);
        });
    });
  });
}
