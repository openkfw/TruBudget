import { FastifyInstance } from "fastify";
import * as jsonwebtoken from "jsonwebtoken";
import { VError } from "verror";
import { toHttpError } from "./http_errors";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import Joi = require("joi");
import { config } from "./config";
import { clearValue } from "lib/keyValueStore";
import { UserLogoutAPIService } from "./index";

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").optional(),
  data: Joi.object().optional(),
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
 * The swagger schema for the `/user.logout` endpoint
 */
const swaggerSchema = {
  preValidation: [],
  schema: {
    description: "Logout current user",
    tags: ["default", "user"],
    summary: "Logout current user",
    body: {
      type: "object",
      required: [],
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
          },
        },
      },
      400: {
        description: "Logout failed",
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          error: {
            type: "object",
            properties: {
              code: { type: "number" },
              message: {
                type: "string",
                example: "Logout failed.",
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
 * Creates an http handler that handles incoming http requests for the `/user.logout` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 */
export function addHttpHandler(
  server: FastifyInstance,
  urlPrefix: string,
  service: UserLogoutAPIService,
): void {
  server.post(`${urlPrefix}/user.logout`, swaggerSchema, async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };
    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "logout failed"));
      request.log.error({ err: bodyResult }, "Invalid request body");
      reply.status(code).send(body);
      return;
    }

    try {
      const currentRefreshToken = request.cookies["refreshToken"];

      // delete refresh token from storage
      if (currentRefreshToken && config.refreshTokenStorage === "memory") {
        clearValue(`refreshToken.${currentRefreshToken}`);
      } else if (currentRefreshToken && config.refreshTokenStorage === "db") {
        await service.clearRefreshToken(currentRefreshToken);
      }
      const body = {
        apiVersion: "1.0",
        data: {},
      };
      reply
        .setCookie(
          "token",
          jsonwebtoken.sign(
            {
              userId: "",
            },
            "thisTokenIsInvalid",
          ),
          {
            path: "/",
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            sameSite: "strict",
            expires: new Date(Date.now()),
          },
        )
        .setCookie(
          "refreshToken",
          jsonwebtoken.sign(
            {
              userId: "",
            },
            "thisTokenIsInvalid",
          ),
          {
            path: "/api/user.refreshtoken",
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            sameSite: "strict",
            expires: new Date(Date.now()),
          },
        )
        .setCookie(
          "refreshToken",
          jsonwebtoken.sign(
            {
              userId: "",
            },
            "thisTokenIsInvalid",
          ),
          {
            path: "/api/user.logout",
            secure: process.env.NODE_ENV !== "development",
            httpOnly: true,
            sameSite: "strict",
            expires: new Date(Date.now()),
          },
        )
        .status(200)
        .send(body);
    } catch (err) {
      const { code, body } = toHttpError(err);
      request.log.error({ err }, "Error while user logout");
      reply.status(code).send(body);
    }
  });
}
