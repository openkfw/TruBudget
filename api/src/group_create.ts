import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import * as GroupCreate from "./service/domain/organization/group_create";
import { ServiceUser } from "./service/domain/organization/service_user";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the type of the group that will be created
 * @notExported
 */
interface Group {
  id: string;
  displayName: string;
  users: string[];
}

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    group: Group;
  };
}

/**
 * Creates the swagger schema for the `/global.createGroup` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Create a new group.",
      tags: ["global"],
      summary: "Create a new group",
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
            additionalProperties: false,
            required: ["group"],
            properties: {
              group: {
                type: "object",
                required: ["id", "displayName", "users"],
                properties: {
                  additionalProperties: false,
                  id: {
                    type: "string",
                    format: "safeIdFormat",
                    example: "Manager",
                  },
                  displayName: {
                    type: "string",
                    format: "safeStringFormat",
                    example: "All Manager Group",
                  },
                  users: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "safeStringFormat",
                      example: "aSmith",
                    },
                  },
                },
              },
            },
          },
        },
        errorMessage: "Failed to create group",
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                group: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                    displayName: { type: "string", example: "admins" },
                    users: { type: "array", items: { type: "string", example: "mstein" } },
                  },
                },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
        409: {
          description: "Group already exists",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "409" },
                message: { type: "string", example: "User already exists." },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Interface representing the service that handles creation of groups
 */
interface Service {
  createGroup(
    ctx: Ctx,
    user: ServiceUser,
    group: GroupCreate.RequestData,
  ): Promise<Result.Type<Group>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.createGroup` route
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
    server.post(`${urlPrefix}/global.createGroup`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const { id, displayName, users } = (request.body as RequestBodyV1).data.group;
      let invokeService = service.createGroup(ctx, user, { id, displayName, members: users });

      invokeService
        .then((groupResult) => {
          if (Result.isErr(groupResult)) throw new VError(groupResult, "global.createGroup failed");
          const group = groupResult;
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              group,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);

          reply.status(code).send(body);
          request.log.error({ err }, "Error while creating group");
        });
    });
  });
}
