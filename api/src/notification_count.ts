import { FastifyInstance } from "fastify";
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Notification from "./service/domain/workflow/notification";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
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

interface Service {
  getNotificationsForUser(
    ctx: Ctx,
    user: ServiceUser,
  ): Promise<Result.Type<Notification.Notification[]>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(`${urlPrefix}/notification.count`, mkSwaggerSchema(server), async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

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
      reply.status(code).send(body);
    }
  });
}
