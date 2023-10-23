import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    groupId: string;
    userIds: string[];
  };
}

/**
 * Creates the swagger schema for the `/group.removeUser` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Remove one or more users from a group",
      tags: ["group"],
      summary: "Remove users from a group",
      security: [
        {
          bearerToken: [],
        },
      ],
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
            required: ["groupId", "userIds"],
            properties: {
              groupId: { type: "string", example: "Manager" },
              userIds: {
                type: "array",
                items: {
                  type: "string",
                  format: "safeIdFormat",
                  example: "aSmith",
                },
              },
            },
          },
        },
        errorMessage: "Failed to remove user from group",
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}
/**
 * Represents the service that handles removing members from a group
 */
interface Service {
  removeGroupMembers(
    ctx: Ctx,
    user: ServiceUser,
    groupId: string,
    userIds: string[],
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/group.removeUser` route
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
    server.post(`${urlPrefix}/group.removeUser`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const { groupId, userIds } = (request.body as RequestBodyV1).data;
      let invokeService = service.removeGroupMembers(ctx, user, groupId, userIds);

      invokeService
        .then((result) => {
          if (Result.isErr(result)) throw new VError(result, "group.removeUser failed");
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {},
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while removing user from group");
          reply.status(code).send(body);
        });
    });
  });
}
