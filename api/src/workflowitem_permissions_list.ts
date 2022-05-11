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
import { getExposablePermissions, Permissions } from "./service/domain/permissions";

function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
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

function sendErrorIfEmpty(reply, resourceId): string | undefined {
  if (!isNonemptyString(resourceId)) {
    const message = `required query parameter ${resourceId} not present (must be non-empty string)`;
    reply.status(400).send({
      apiVersion: "1.0",
      error: {
        code: 400,
        message,
      },
    });
    return message;
  }
  return;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
    workflowitemId: string;
  };
}

export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.get<Request>(
    `${urlPrefix}/workflowitem.intent.listPermissions`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const { projectId, subprojectId, workflowitemId } = request.query;
      const message =
        sendErrorIfEmpty(reply, projectId) ||
        sendErrorIfEmpty(reply, subprojectId) ||
        sendErrorIfEmpty(reply, workflowitemId);

      if (message) {
        request.log.error({ err: message }, "Invalid request body");
        return;
      }
      try {
        const permissionsResult = await service.listWorkflowitemPermissions(
          ctx,
          user,
          projectId,
          subprojectId,
          workflowitemId,
        );
        if (Result.isErr(permissionsResult)) {
          throw new VError(permissionsResult, "workflowitem.intent.listPermissions failed");
        }
        const permissions = permissionsResult;

        const filteredPermissions = getExposablePermissions(permissions, ["workflowitem.close"]);

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: filteredPermissions,
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        request.log.error({ err }, "Error while listing workflowitem permissions");
        reply.status(code).send(body);
      }
    },
  );
}
