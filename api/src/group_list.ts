import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import * as Group from "./service/domain/organization/group";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserRecord from "./service/domain/organization/user_record";
import { extractUser } from "handlerUtils";
import { AuthenticatedRequest } from "httpd/lib";

/**
 * Creates the swagger schema for the `/group.list` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "List all user groups.",
      tags: ["group"],
      summary: "List all existing groups",
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
              properties: {
                groups: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      groupId: { type: "string", example: "Manager" },
                      displayName: { type: "string", example: "All Manager Group" },
                      users: {
                        type: "array",
                        items: { type: "string", example: "aSmith" },
                      },
                      permissions: { type: "object", additionalProperties: true },
                    },
                  },
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

/**
 * Represents the type of the group that will be returned in a list
 * @notExported
 */
interface ExposedGroup {
  groupId: string;
  displayName: string;
  users: UserRecord.Id[];
}

/**
 * Represents the service that handles listing of groups
 */
interface Service {
  listGroups(ctx: Ctx, user: ServiceUser): Promise<Result.Type<Group.Group[]>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/group.list` route
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
    server.get(`${urlPrefix}/group.list`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const issuer = extractUser(request as AuthenticatedRequest);

      service
        .listGroups(ctx, issuer)
        .then((groupResult: Result.Type<Group.Group[]>) => {
          if (Result.isErr(groupResult)) throw new VError(groupResult, "group.list failed");
          const groups = groupResult;
          return groups.map((group) => {
            return {
              groupId: group.id,
              displayName: group.displayName,
              users: group.members,
              permissions: group.permissions,
            };
          });
        })
        .then((groups: ExposedGroup[]) => {
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              groups,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while fetching all groups");
          reply.status(code).send(body);
        });
    });
  });
}
