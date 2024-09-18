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
import { JwtConfig, config } from "./config";
import { AugmentedFastifyInstance } from "./types";
import {
  MAX_GROUPS_LENGTH,
  accessTokenExpirationInMinutesWithrefreshToken,
} from "./user_authenticate";
import { AuthenticatedRequest } from "./httpd/lib";

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    accessTokenExp?: number;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object(),
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
 * The swagger schema for the `/user.refreshtoken` endpoint
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function swaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Authenticate using refresh token and retrieve a token in return. This token can then be supplied in the " +
        "HTTP Authorization header, which is expected by most of the other. " +
        "\nIf a token is required write 'Bearer' into the 'API Token' field of an endpoint " +
        "you want to test and copy the token afterwards like in the following example:\n " +
        ".\n" +
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      tags: ["default", "refreshtoken"],
      summary: "Authenticate with token and refresh token",
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
                accessTokenExp: {
                  type: "number",
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
}

/**
 * Represents the service that authenticates a user
 */
interface Service {
  validateRefreshToken(
    ctx: Ctx,
    userId: string,
    refreshToken: string | undefined,
  ): Promise<Result.Type<AuthToken>>;
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
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
  jwt: JwtConfig,
): void {
  server.post(`${urlPrefix}/user.refreshtoken`, swaggerSchema(server), async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };
    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "authentication failed 1"));
      request.log.error({ err: bodyResult }, "Invalid request body");
      reply.status(code).send(body);
      return;
    }

    let invokeService: Promise<Result.Type<AuthToken>>;
    switch (bodyResult.apiVersion) {
      case "1.0": {
        const data = bodyResult.data;
        invokeService = service.validateRefreshToken(
          ctx,
          (request as AuthenticatedRequest).user.userId,
          request.cookies["refreshToken"],
        );
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
        throw new VError(tokenResult, "authentication failed 2");
      }
      const token = tokenResult;
      const signedJwt = createJWT(
        token,
        jwt.secretOrPrivateKey,
        jwt.algorithm as "HS256" | "RS256",
      );
      const refreshToken = createRefreshJWTToken(
        token.userId,
        jwt.secretOrPrivateKey,
        jwt.algorithm as "HS256" | "RS256",
      );

      const groupsResult = await service.getGroupsForUser(
        ctx,
        { id: token.userId, groups: token.groups, address: token.address },
        token.userId,
      );
      if (Result.isErr(groupsResult)) {
        throw new VError(groupsResult, "authentication failed 3");
      }

      const body: RequestBodyV1 = {
        apiVersion: "1.0",
        data: {},
      };
      // conditionally add token expiration to payload
      request.log.warn(`checking  accessTokenExp ${config.refreshTokenStorage}`);
      if (config.refreshTokenStorage && ["db", "memory"].includes(config.refreshTokenStorage)) {
        request.log.warn("adding accessTokenExp");
        body.data.accessTokenExp = 1000 * 60 * accessTokenExpirationInMinutesWithrefreshToken;
      }

      reply
        .setCookie("token", signedJwt, {
          path: "/",
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
  });
}

/**
 * Creates a JWT Token containing information about the user
 *
 * @param token the current {@link AuthToken} containing information about the user
 * @returns a string containing the encoded JWT token
 */
function createJWT(
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
    },
    secretOrPrivateKey,
    { expiresIn: "8h", algorithm },
  );
}

/**
 * Creates a refresh JWT Token
 *
 * @param userId the current user ID
 * @returns a string containing the encoded JWT token
 */
function createRefreshJWTToken(
  userId: string,
  key: string,
  algorithm: JwtConfig["algorithm"] = "HS256",
): string {
  const secretOrPrivateKey = algorithm === "RS256" ? Buffer.from(key, "base64") : key;
  return jsonwebtoken.sign(
    {
      userId,
    },
    secretOrPrivateKey,
    { expiresIn: "8d", algorithm },
  );
}
