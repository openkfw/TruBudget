import { FastifyInstance } from "fastify";
import * as jsonwebtoken from "jsonwebtoken";
import { VError } from "verror";
import { toHttpError } from "./http_errors";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { AuthToken } from "./service/domain/organization/auth_token";
import { Group } from "./service/domain/organization/group";
import { ServiceUser } from "./service/domain/organization/service_user";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    user: {
      id: string;
      password: string;
    };
  };
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
}

/**
 * The swagger schema for the `/user.authenticate` endpoint
 */
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
    tags: ["default", "user"],
    summary: "Authenticate with user and password",
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
          required: ["user"],
          properties: {
            user: {
              type: "object",
              required: ["id", "password"],
              properties: {
                id: { type: "string", format: "safeIdFormat", example: "mstein" },
                password: { type: "string", format: "safePasswordFormat", example: "test" },
              },
            },
          },
        },
      },
      errorMessage: "Authentication failed",
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

/**
 * Represents the service that authenticates a user
 */
interface Service {
  authenticate(ctx: Ctx, userId: string, password: string): Promise<Result.Type<AuthToken>>;
  getGroupsForUser(
    ctx: Ctx,
    serviceUser: ServiceUser,
    userId: string,
  ): Promise<Result.Type<Group[]>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/user.authenticate` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: FastifyInstance,
  urlPrefix: string,
  service: Service,
  jwtSecret: string,
): void {
  server.post(`${urlPrefix}/user.authenticate`, swaggerSchema, async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const data = (request.body as RequestBodyV1).data;
    let invokeService = service.authenticate(ctx, data.user.id, data.user.password);

    try {
      const tokenResult = await invokeService;
      if (Result.isErr(tokenResult)) {
        throw new VError(tokenResult, "authentication failed");
      }
      const token = tokenResult;
      const signedJwt = createJWT(token, jwtSecret);

      const groupsResult = await service.getGroupsForUser(
        ctx,
        { id: token.userId, groups: token.groups, address: token.address },
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
      };
      const body = {
        apiVersion: "1.0",
        data: {
          user: loginResponse,
        },
      };
      reply
        .setCookie("token", signedJwt, {
          path: "/",
          secure: process.env.NODE_ENV !== "development",
          httpOnly: true,
          sameSite: "strict",
        })
        .status(200)
        .send(body);
    } catch (err) {
      const { code, body } = toHttpError(err);
      request.log.error({ err }, "Error while user authenticate");
      reply.status(code).send(body);
    }
  });
}

/**
 * Creates a JWT Token containing information about the user
 *
 * @param token the current {@link AuthToken} containing information about the user
 * @param secret a secret to be used to sign the jwt token with
 * @returns a string containing the encoded JWT token
 */
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
