import { RequestGenericInterface } from "fastify";
import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { Permissions } from "./service/domain/permissions";

function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "See the permissions for a given group.",
      tags: ["group"],
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
                "group.addUser": ["aSmith"],
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
  getGroupPermissions(
    ctx: Ctx,
    servcieUser: ServiceUser,
    groupId: string,
  ): Promise<Result.Type<Permissions>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    groupId: string;
  };
}

export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.get<Request>(
    `${urlPrefix}/group.intent.listPermissions`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const groupId = request.query.groupId;
      if (!isNonemptyString(groupId)) {
        const message = "required query parameter `groupId` not present (must be non-empty string)";
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
        const groupPermissionsResult = await service.getGroupPermissions(ctx, user, groupId);

        if (Result.isErr(groupPermissionsResult)) {
          throw new VError(groupPermissionsResult, "group.intent.listPermission failed");
        }
        const groupPermissions = groupPermissionsResult;
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: groupPermissions,
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        request.log.error({ err }, "Error while fetching permissions of group");
        reply.status(code).send(body);
      }
    },
  );
}
