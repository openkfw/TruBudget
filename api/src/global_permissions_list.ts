import { FastifyInstance } from "fastify";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { GlobalPermissions } from "./service/domain/workflow/global_permissions";
import { VError } from "verror";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description: "See the current global permissions.",
      tags: ["global"],
      summary: "List all global permissions",
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
              example: { "notification.list": ["aSmith"], "notification.markRead": ["aSmith"] },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface Service {
  getGlobalPermissions(ctx: Ctx, user: ServiceUser): Promise<Result.Type<GlobalPermissions>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(
    `${urlPrefix}/global.listPermissions`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      try {
        const globalPermissionsResult = await service.getGlobalPermissions(ctx, user);
        if (Result.isErr(globalPermissionsResult))
          throw new VError(globalPermissionsResult, "global.listPermissions failed");
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: globalPermissionsResult.permissions,
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
