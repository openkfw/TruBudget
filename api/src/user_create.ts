import Joi = require("joi");
import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { assertUnreachable } from "./lib/assertUnreachable";
import { Ctx } from "./lib/ctx";
import { safeIdSchema, safePasswordSchema, safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { AuthToken } from "./service/domain/organization/auth_token";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserCreate from "./service/domain/organization/user_create";

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    user: {
      id: string;
      displayName: string;
      organization: string;
      password: string;
    };
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    user: Joi.object({
      id: safeIdSchema.required(),
      displayName: safeStringSchema.required(),
      organization: safeStringSchema.required(),
      password: safePasswordSchema.required(),
    }).required(),
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

interface ResponseUserRecord {
  id: string;
  displayName: string;
  organization: string;
  address: string;
}

/**
 * Creates the swagger schema for the `/global.createUser` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Create a new user.",
      tags: ["global"],
      summary: "Create a user",
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
            required: ["user"],
            properties: {
              user: {
                type: "object",
                required: ["id", "displayName", "organization", "password"],
                properties: {
                  id: { type: "string", example: "aSmith" },
                  displayName: { type: "string", example: "Alice Smith" },
                  organization: { type: "string", example: "Alice's Solutions & Co" },
                  address: { type: "string", example: "ab2354defa123c01275a83bc1d" },
                },
              },
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
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    displayName: { type: "string", example: "Alice Smith" },
                    organization: { type: "string", example: "Alice's Solutions & Co" },
                    address: {
                      type: "string",
                      example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                    },
                  },
                },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
        409: {
          description: "User already exists",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "409" },
                message: { type: "string", example: "User already exists." },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Represents the service that creates a user
 */
interface Service {
  createUser(
    ctx: Ctx,
    serviceUser: ServiceUser,
    requestData: UserCreate.RequestData,
  ): Promise<Result.Type<AuthToken>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.createUser` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.post(`${urlPrefix}/global.createUser`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const serviceUser: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
      address: (request as AuthenticatedRequest).user.address,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to create user"));
      request.log.error({ err: bodyResult }, "Invalid request body");
      reply.status(code).send(body);
      return;
    }

    let invokeService: Promise<Result.Type<AuthToken>>;
    switch (bodyResult.apiVersion) {
      case "1.0": {
        const data = bodyResult.data;
        invokeService = service.createUser(ctx, serviceUser, {
          userId: data.user.id,
          displayName: data.user.displayName,
          organization: data.user.organization,
          passwordPlaintext: data.user.password,
        });
        break;
      }
      default:
        // Joi validates only existing apiVersions
        request.log.error({ err: bodyResult }, "Wrong api version specified");
        assertUnreachable(bodyResult.apiVersion);
    }

    invokeService
      .then((createdUserResult) => {
        if (Result.isErr(createdUserResult)) {
          throw new VError(createdUserResult, "global.createUser failed");
        }
        const createdUser = createdUserResult;
        const code = 200;
        const publicUserData: ResponseUserRecord = {
          id: createdUser.userId,
          displayName: createdUser.displayName,
          organization: createdUser.organization,
          address: createdUser.address,
        };
        const body = {
          apiVersion: "1.0",
          data: {
            user: publicUserData,
          },
        };
        reply.status(code).send(body);
      })
      .catch((err) => {
        const { code, body } = toHttpError(err);
        request.log.error({ err }, "Error while creating user");
        reply.status(code).send(body);
      });
  });
}
