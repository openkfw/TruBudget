import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Joi = require("joi");
import * as jsonwebtoken from "jsonwebtoken";
import { VError } from "verror";

import {
  accessTokenExpirationInHoursWithrefreshToken,
  createRefreshJWTToken,
  refreshTokenExpirationInHours,
} from "./authenticationUtils";
import { JwtConfig, config } from "./config";
import { toHttpError } from "./http_errors";
import { assertUnreachable } from "./lib/assertUnreachable";
import { Ctx } from "./lib/ctx";
import { kvStore } from "./lib/keyValueStore";
import * as Result from "./result";
import { AuthToken } from "./service/domain/organization/auth_token";
import { Group } from "./service/domain/organization/group";
import { ServiceUser } from "./service/domain/organization/service_user";

const MAX_GROUPS_LENGTH = 3000;

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    token: string;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    token: Joi.string().required(),
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

interface RequestResponse {
  apiVersion: string;
  data: {
    user: LoginResponse;
    accessTokenExp?: number;
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
  token: string; // JWT
}

/**
 * The swagger schema for the `/user.authenticate` endpoint
 */
const swaggerSchema = {
  preValidation: [],
  schema: {
    description: "Authenticate user with credentials supplied by custom authentication proxy",
    tags: ["default", "user"],
    summary: "Authenticate with user and password",
    body: {
      type: "object",
      required: ["apiVersion", "data"],
      properties: {
        apiVersion: { type: "string", example: "1.0" },
        data: {
          type: "object",
          required: ["token"],
          properties: {
            token: { type: "string", example: "someExample" },
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

/**
 * Represents the service that authenticates a user
 */
interface Service {
  authenticateToken(ctx: Ctx, token: string, csrf: string): Promise<Result.Type<AuthToken>>;
  getGroupsForUser(
    ctx: Ctx,
    serviceUser: ServiceUser,
    userId: string,
  ): Promise<Result.Type<Group[]>>;
  storeRefreshToken(userId: string, refreshToken: string, validUntil: number): Promise<void>;
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
  jwt: JwtConfig,
): void {
  server.post(
    `${urlPrefix}/user.authenticateAd`,
    swaggerSchema,
    async (request: FastifyRequest, reply: FastifyReply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };
      const bodyResult = validateRequestBody(request.body);

      const authorizationToken = request.cookies[config.authProxy.authProxyCookie];

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(new VError(bodyResult, "authentication failed"));
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      if (!authorizationToken) {
        const { code, body } = toHttpError(new VError("authentication failed"));
        request.log.error({ err: "Missing authorizationToken cookie" }, "Invalid request");
        reply.status(code).send(body);
        return;
      }

      let invokeService: Promise<Result.Type<AuthToken>>;
      switch (bodyResult.apiVersion) {
        case "1.0": {
          const data = bodyResult.data;
          invokeService = service.authenticateToken(ctx, authorizationToken, data.token);
          break;
        }
        default:
          // Joi validates only existing apiVersions
          request.log.error({ err: bodyResult }, "Wrong api version specified");
          assertUnreachable(bodyResult.apiVersion);
      }

      try {
        const tokenResult = await invokeService;
        if (Result.isErr(tokenResult)) {
          throw new VError(tokenResult, "authentication failed");
        }
        const token = tokenResult;
        const signedJwt = createJWTWithMeta(token, jwt.secretOrPrivateKey, jwt.algorithm);

        // store refresh token
        const now = new Date();
        // time in miliseconds of refresh token expiration
        const refreshTokenExpiration = new Date(
          now.getTime() + 1000 * 60 * 60 * refreshTokenExpirationInHours,
        );
        const refreshToken = createRefreshJWTToken(
          { userId: token.userId, expirationAt: refreshTokenExpiration },
          jwt.secretOrPrivateKey,
          jwt.algorithm as "HS256" | "RS256",
        );

        if (config.refreshTokenStorage === "memory") {
          kvStore.save(
            `refreshToken.${refreshToken}`,
            {
              userId: token.userId,
            },
            refreshTokenExpiration,
          );
        } else if (config.refreshTokenStorage === "db") {
          await service.storeRefreshToken(
            token.userId,
            refreshToken,
            refreshTokenExpiration.getTime(),
          );
        }

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
          token: signedJwt,
        };

        const body: RequestResponse = {
          apiVersion: "1.0",
          data: {
            user: loginResponse,
          },
        };

        // conditionally add token expiration to payload
        if (config.refreshTokenStorage && ["db", "memory"].includes(config.refreshTokenStorage)) {
          body.data.accessTokenExp = 1000 * 60 * 60 * accessTokenExpirationInHoursWithrefreshToken;
        }

        reply
          .setCookie("token", signedJwt, {
            path: "/",
            secure: config.secureCookie,
            httpOnly: true,
            sameSite: true,
          })
          .setCookie("refreshToken", refreshToken, {
            path: "/api/user.refreshtoken",
            secure: config.secureCookie,
            httpOnly: true,
            sameSite: "strict",
          })
          .setCookie("refreshToken", refreshToken, {
            path: "/api/user.logout",
            secure: config.secureCookie,
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
    },
  );
}

/**
 * Creates a JWT Token containing information about the user
 *
 * @param token the current {@link AuthToken} containing information about the user
 * @returns a string containing the encoded JWT token
 */
function createJWTWithMeta(
  token: AuthToken,
  key: string,
  algorithm: JwtConfig["algorithm"] = "HS256",
): string {
  // when server tries to cram too much data into the cookie, browser will reject it
  function setGroups(): string[] | null {
    return token.groups.join(",").length < MAX_GROUPS_LENGTH ? token.groups : null;
  }

  const secretOrPrivateKey = algorithm === "RS256" ? Buffer.from(key, "base64") : key;
  return jsonwebtoken.sign(
    {
      userId: token.userId,
      address: token.address,
      organization: token.organization,
      organizationAddress: token.organizationAddress,
      groups: setGroups(),
      metadata: token.metadata,
    },
    secretOrPrivateKey,
    { expiresIn: "8h", algorithm },
  );
}
