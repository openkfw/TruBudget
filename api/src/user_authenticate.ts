import { FastifyInstance } from "fastify";
import * as jsonwebtoken from "jsonwebtoken";
import { VError } from "verror";
import { toHttpError } from "./http_errors";
import { assertUnreachable } from "./lib/assertUnreachable";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { AuthToken } from "./service/domain/organization/auth_token";
import { Group } from "./service/domain/organization/group";
import { ServiceUser } from "./service/domain/organization/service_user";
import Joi = require("joi");

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    user: {
      id: string;
      password: string;
    };
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    user: Joi.object({
      id: Joi.string().required(),
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

interface LoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  groups: Array<{
    groupId: string;
    displayName: string;
  }>;
  token: string; // JWT
}

const swaggerSchema = {
  preValidation: [],
  schema: {
    description:
      "Authenticate and retrieve a token in return. This token can then be supplied in the " +
      "HTTP Authorization header, which is expected by most of the other. " +
      "\nIf a token is required write 'Bearer' into the 'API Token' field of an endpoint " +
      "you want to test and copy the token afterwards like in the following example:\n " +
      ".\n" +
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    tags: ["user"],
    summary: "Authenticate with user and password",
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
              required: ["id", "password"],
              properties: {
                id: { type: "string", example: "aSmith" },
                password: { type: "string", example: "mySecretPassword" },
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
                  id: { type: "string", example: "aSmith" },
                  displayName: { type: "string", example: "Alice Smith" },
                  organization: { type: "string", example: "Alice's Solutions & Co" },
                  allowedIntents: { type: "array", items: { type: "string" } },
                  groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        groupId: { type: "string", example: "Manager" },
                        displayName: { type: "string", example: "All Manager Group" },
                      },
                    },
                  },
                  token: {
                    type: "string",
                    example:
                      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwiYWRkcm" +
                      "VzcyI6IjFIVXF2dHE5WU1QaXlMZUxWM3pGRks5dGpBblVDVTNFbTQzaVBrIiwib3JnYW" +
                      "5pemF0aW9uIjoiS2ZXIiwib3JnYW5pemF0aW9uQWRkcmVzcyI6IjFIVXF2dHE5WU1QaXl" +
                      "MZUxWM3pGRks5dGpBblVDVTNFbTQzaVBrIiwiZ3JvdXBzIjpbXSwiaWF0IjoxNTM2ODI2M" +
                      "TkyLCJleHAiOjE1MzY4Mjk3OTJ9.PZbjTpsgnIHjNaDHos9LVwwrckYhpWjv1DDiojskylI",
                  },
                },
              },
            },
          },
        },
      },
      400: {
        description: "Authentication failed",
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          error: {
            type: "object",
            properties: {
              code: { type: "number" },
              message: {
                type: "string",
                example: "Authentication failed.",
              },
            },
          },
        },
      },
      403: {
        description: "Not Authorized",
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          error: {
            type: "object",
            properties: {
              code: { type: "number" },
              message: {
                type: "string",
                example: "Not Authorized.",
              },
            },
          },
        },
      },
    },
  },
};

interface Service {
  authenticate(ctx: Ctx, userId: string, password: string): Promise<Result.Type<AuthToken>>;
  getGroupsForUser(
    ctx: Ctx,
    serviceUser: ServiceUser,
    userId: string,
  ): Promise<Result.Type<Group[]>>;
}

export function addHttpHandler(
  server: FastifyInstance,
  urlPrefix: string,
  service: Service,
  jwtSecret: string,
) {
  server.post(`${urlPrefix}/user.authenticate`, swaggerSchema, async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "authentication failed"));
      reply.status(code).send(body);
      return;
    }

    let invokeService: Promise<Result.Type<AuthToken>>;
    switch (bodyResult.apiVersion) {
      case "1.0": {
        const data = bodyResult.data;
        invokeService = service.authenticate(ctx, data.user.id, data.user.password);
        break;
      }
      default:
        // Joi validates only existing apiVersions
        assertUnreachable(bodyResult.apiVersion);
    }

    try {
      const tokenResult = await invokeService;
      if (Result.isErr(tokenResult)) {
        throw new VError(tokenResult, "authentication failed");
      }
      const token = tokenResult;
      const signedJwt = createJWT(token, jwtSecret);

      const groupsResult = await service.getGroupsForUser(
        ctx,
        { id: token.userId, groups: token.groups },
        token.userId,
      );
      if (Result.isErr(groupsResult)) {
        throw new VError(groupsResult, "authentication failed");
      }
      const groups = groupsResult;

      const loginResponse: LoginResponse = {
        id: token.userId,
        displayName: token.displayName,
        organization: token.organization,
        allowedIntents: token.allowedIntents,
        groups: groups.map((x) => ({ groupId: x.id, displayName: x.displayName })),
        token: signedJwt,
      };
      const body = {
        apiVersion: "1.0",
        data: {
          user: loginResponse,
        },
      };
      reply.status(200).send(body);
    } catch (err) {
      const { code, body } = toHttpError(err);
      reply.status(code).send(body);
    }
  });
}

function createJWT(token: AuthToken, secret: string): string {
  return jsonwebtoken.sign(
    {
      userId: token.userId,
      address: token.address,
      organization: token.organization,
      organizationAddress: token.organizationAddress,
      groups: token.groups,
    },
    secret,
    { expiresIn: "8h" },
  );
}
