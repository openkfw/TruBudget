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

/**
 * Creates the swagger schema for the `/notification.count` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Counts the number of notifications for the authenticated user. Returns the " +
        "total as well as the number of unread notifications.",
      tags: ["notification"],
      summary: "Notification count for the authenticated user.",
      security: [{ bearerToken: [] }],
      response: {
        200: {
          description: "Notification count for the authenticated user.",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                userId: { type: "string", example: "jdoe" },
                unread: {
                  type: "integer",
                  description: "The number of unread notifications for this user.",
                  example: 0,
                },
                total: {
                  type: "integer",
                  description: "The total number of notifications for this user.",
                  example: 0,
                },
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
 * Represents the service that handles counting notifications
 */
interface Service {
  getNotificationsForUser(
    ctx: Ctx,
    user: ServiceUser,
  ): Promise<Result.Type<Notification.Notification[]>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/notification.count` route
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
    server.get(
      `${urlPrefix}/notification.count`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        try {
          const notificationsResult = await service.getNotificationsForUser(ctx, user);
          if (Result.isErr(notificationsResult)) {
            throw new VError(notificationsResult, "notification.count failed");
          }
          const notifications = notificationsResult;
          const total = notifications.length;
          const unread = notifications.filter((x) => !x.isRead).length;

          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              userId: user.id,
              total,
              unread,
            },
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while counting notifications");
          reply.status(code).send(body);
        }
      },
    );
  });
}
