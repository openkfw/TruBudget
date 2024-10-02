import { VError } from "verror";

import { extractUser } from "./handlerUtils";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { GlobalPermissions } from "./service/domain/workflow/global_permissions";
import { AugmentedFastifyInstance } from "./types";

/**
 * Creates the swagger schema for the `/global.listPermissions` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
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

/**
 * Interface representing the service that handles listing of global permissions
 */
interface Service {
  getGlobalPermissions(ctx: Ctx, user: ServiceUser): Promise<Result.Type<GlobalPermissions>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.listPermissions` route
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
      `${urlPrefix}/global.listPermissions`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

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
          request.log.error({ err }, "Error while fetching global permisions");
          reply.status(code).send(body);
        }
      },
    );
  });
}
