import { AugmentedFastifyInstance } from "./types";
import { Ctx } from "./lib/ctx";
import * as jsonwebtoken from "jsonwebtoken";
import axios from "axios";
import { JwtConfig, config } from "config";
import { Type } from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { Permissions } from "service/domain/permissions";
import { toHttpError } from "http_errors";

const API_VERSION = "1.0";

/**
 * Represents the request body of the endpoint
 */
interface RequestBody {
  data: {
    email: string;
    url: string;
  };
}

/**
 * Creates the swagger schema for the `v2/user.forgotPassword` endpoint
 * This is a comment.
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(): Object {
  return {
    schema: {
      description: "Validates user email and sends link to reset password",
      tags: ["forgotPassword", "v1"],
      summary: "User forgot password",
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["email"],
            properties: {
              email: { type: "string", example: "test@test.com" },
              url: { type: "string", example: "http://localhost" },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          required: ["apiVersion", "data"],
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            emailSent: { type: "string", example: "Email sent" },
          },
        },
      },
    },
  };
}

/**
 * Represents the service that gets a user's permissions
 */
interface Service {
  getUserPermissions(ctx: Ctx, user: ServiceUser, userId: string): Promise<Type<Permissions>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/v2/project.list` route
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
    server.post(`${urlPrefix}/user.forgotPassword`, mkSwaggerSchema(), async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };
      const body = request.body as RequestBody;
      const { email, url } = body.data;
      const { emailService } = config;
      const getUserByEmailUrl = "user.getUserByEmail?email=";
      const sendResetPasswordUrl = "sendResetPasswordEmail";

      try {
        const { data } = await axios.get(
          `http://${emailService.host}:${emailService.port}/${getUserByEmailUrl}${email}`,
        );

        if (data) {
          const { user } = data;
          const userPermissions = await service.getUserPermissions(
            ctx,
            { id: user.id, groups: [""], address: "" },
            user.id,
          );

          if (userPermissions["user.authenticate"].includes(user.id)) {
            const signedJwt = createJWT(
              { userId: user.id, intent: "user.changePassword" },
              jwt.secretOrPrivateKey,
              jwt.algorithm,
            );
            const emailText = `${url}/reset-password?id=${user.id}&resetToken=${signedJwt}`;
            await axios.post(
              `http://${emailService.host}:${emailService.port}/${sendResetPasswordUrl}`,
              { data: { ...user, emailText } },
            );
            reply.status(200).send({
              apiVersion: API_VERSION,
              data: {
                message: "Reset password e-mail sent",
              },
            });
          } else {
            reply.status(400).send({
              apiVersion: API_VERSION,
              error: {
                code: 400,
                message: "Incorrect e-mail address",
              },
            });
          }
        } else {
          reply.status(400).send({
            apiVersion: API_VERSION,
            error: {
              code: 400,
              message: "Incorrect e-mail address",
            },
          });
        }
      } catch (error) {
        const { code, body } = toHttpError(error, API_VERSION);
        request.log.error({ error }, "Error while sending reset password email");
        reply.status(code).send(body);
      }
    });
  });
}

/**
 * Creates a JWT Token containing information about the user
 *
 * @param token the current {@link AuthToken} containing information about the user
 * @returns a string containing the encoded JWT token
 */
function createJWT(
  token: { userId: string; intent: string },
  key: string,
  algorithm: JwtConfig["algorithm"] = "HS256",
): string {
  const secretOrPrivateKey = algorithm === "RS256" ? Buffer.from(key, "base64") : key;
  return jsonwebtoken.sign(
    {
      userId: token.userId,
      intent: token.intent,
    },
    secretOrPrivateKey,
    { expiresIn: "15m", algorithm },
  );
}
