import { FastifyInstance } from "fastify";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { Permissions } from "./service/domain/permissions";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    schema: {
      description: "See the permissions for a given workflowitem.",
      tags: ["workflowitem"],
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
          workflowitemId: {
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
  listWorkflowitemPermissions(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Permissions>>;
}

function sendErrorIfEmpty(reply, resourceId) {
  if (!isNonemptyString(resourceId)) {
    reply.status(400).send({
      apiVersion: "1.0",
      error: {
        code: 400,
        message: `required query parameter ${resourceId} not present (must be non-empty string)`,
      },
    });
    return true;
  }
  return false;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(
    `${urlPrefix}/workflowitem.intent.listPermissions`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const { projectId, subprojectId, workflowitemId } = request.query;

      if (
        sendErrorIfEmpty(reply, projectId) ||
        sendErrorIfEmpty(reply, subprojectId) ||
        sendErrorIfEmpty(reply, workflowitemId)
      ) {
        return;
      }
      try {
        const workflowitemPermissions = await service.listWorkflowitemPermissions(
          ctx,
          user,
          projectId,
          subprojectId,
          workflowitemId,
        );

        if (Result.isErr(workflowitemPermissions)) {
          workflowitemPermissions.message = `could not list project permissions: ${
            workflowitemPermissions.message
          }`;
          throw workflowitemPermissions;
        }

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: workflowitemPermissions,
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
