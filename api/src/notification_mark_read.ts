import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Notification from "./service/domain/workflow/notification";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    notifications: Notification.Id[];
  };
}

/**
 * Creates the swagger schema for the `/notification.markRead` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: 'Mark a set of notifications as "read".',
      tags: ["notification"],
      summary: 'Mark a set of notifications as "read".',
      security: [{ bearerToken: [] }],
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
            required: ["notifications"],
            properties: {
              notifications: {
                type: "array",
                items: {
                  type: "string",
                  format: "notificationIdFormat",
                  description: "Notification ID",
                  example: "2cfd0663-1770-4184-974e-63129061d389",
                },
              },
            },
          },
        },
        errorMessage: "Failed to mark notification",
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: { type: "object" },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that handles marking notifications as read
 */
interface Service {
  markRead(
    ctx: Ctx,
    user: ServiceUser,
    notificationIds: Notification.Id[],
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/notification.markRead` route
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
    server.post(
      `${urlPrefix}/notification.markRead`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const { notifications } = (request.body as RequestBodyV1).data;

        try {
          const result = await service.markRead(ctx, user, notifications);
          if (Result.isErr(result)) {
            throw new VError(result, "notification.markRead failed");
          }
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {},
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while marking notification as read");
          reply.status(code).send(body);
        }
      },
    );
  });
}
