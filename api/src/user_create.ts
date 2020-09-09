import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { assertUnreachable } from "./lib/assertUnreachable";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { AuthToken } from "./service/domain/organization/auth_token";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserCreate from "./service/domain/organization/user_create";
import Joi = require("joi");

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
      id: Joi.string().required(),
      displayName: Joi.string().required(),
      organization: Joi.string().required(),
      password: Joi.string().required(),
    }).required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

interface ResponseUserRecord {
  id: string;
  displayName: string;
  organization: string;
  address: string;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
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

interface Service {
  createUser(
    ctx: Ctx,
    serviceUser: ServiceUser,
    requestData: UserCreate.RequestData,
  ): Promise<Result.Type<AuthToken>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(`${urlPrefix}/global.createUser`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const serviceUser: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to create user"));
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
        reply.status(code).send(body);
      });
  });
}
