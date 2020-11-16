import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { filterPermissions, Permissions } from "./service/domain/permissions";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description: "See the permissions for a given subproject.",
      tags: ["subproject"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
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
                "project.viewDetails": ["aSmith", "jDoe"],
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
  listSubprojectPermissions(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Permissions>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
  };
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
    `${urlPrefix}/subproject.intent.listPermissions`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const projectId = request.query.projectId;
      if (!isNonemptyString(projectId)) {
        reply.status(404).send({
          apiVersion: "1.0",
          error: {
            code: 404,
            message: "required query parameter `projectId` not present (must be non-empty string)",
          },
        });
        return;
      }

      const subprojectId = request.query.subprojectId;
      if (!isNonemptyString(subprojectId)) {
        reply.status(404).send({
          apiVersion: "1.0",
          error: {
            code: 404,
            message:
              "required query parameter `subprojectId` not present (must be non-empty string)",
          },
        });
        return;
      }

      try {
        const subprojectPermissionsResult = await service.listSubprojectPermissions(
          ctx,
          user,
          projectId,
          subprojectId,
        );

        if (Result.isErr(subprojectPermissionsResult)) {
          throw new VError(subprojectPermissionsResult, "subproject.intent.listPermissions failed");
        }
        const subprojectPermissions = subprojectPermissionsResult;

        // TODO use an exposedPermissions interface instead of a filter function
        const filteredSubprojectPermissions = filterPermissions(subprojectPermissions, [
          "subproject.close",
          "subproject.archive",
        ]);

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: filteredSubprojectPermissions,
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
