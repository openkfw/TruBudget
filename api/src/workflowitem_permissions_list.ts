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
import { getExposablePermissions, Permissions } from "./service/domain/permissions";
import { AugmentedFastifyInstance } from "./types";

/**
 * Creates the swagger schema for the `/workflowitem.intent.listPermissions` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
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

/**
 * Represents the service that lists workflowitem permissions
 */
interface Service {
  listWorkflowitemPermissions(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Permissions>>;
}

/**
 * Sends back an error as a reply if the given resourceId is empty
 *
 * @param reply the reply to the request
 * @param resourceId a resourceId as a string to be checked
 * @returns the message of the error in case an error is returned, undefined otherwise
 */
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

/**
 * Creates an http handler that handles incoming http requests for the `/workflowitem.intent.listPermissions` route
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
      `${urlPrefix}/workflowitem.intent.listPermissions`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

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
  });
}
