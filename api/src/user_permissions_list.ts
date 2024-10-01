import { RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { extractUser } from "./handlerUtils";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { Permissions } from "./service/domain/permissions";
import { AugmentedFastifyInstance } from "./types";

/**
 * Creates the swagger schema for the `/user.intent.listPermissions` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "See the permissions for a given user.",
      tags: ["user"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          userId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: true,
              example: {
                "user.changePassword": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that gets a user's permissions
 */
interface Service {
  getUserPermissions(
    ctx: Ctx,
    user: ServiceUser,
    userId: string,
  ): Promise<Result.Type<Permissions>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    userId: string;
  };
}

/**
 * Creates an http handler that handles incoming http requests for the `/user.intent.listPermissions` route
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
    server.get<Request>(
      `${urlPrefix}/user.intent.listPermissions`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const userId = request.query.userId;
        if (!isNonemptyString(userId)) {
          const message =
            "required query parameter `userId` not present (must be non-empty string)";
          reply.status(404).send({
            apiVersion: "1.0",
            error: {
              code: 404,
              message,
            },
          });
          request.log.error({ err: message }, "Invalid request body");
          return;
        }

        try {
          const userPermissionsResult = await service.getUserPermissions(ctx, user, userId);

          if (Result.isErr(userPermissionsResult)) {
            throw new VError(userPermissionsResult, "user.intent.listPermission failed");
          }
          const userPermissions = userPermissionsResult;
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: userPermissions,
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while listing user permissions");
          reply.status(code).send(body);
        }
      },
    );
  });
}
