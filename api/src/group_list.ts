import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import * as Group from "./service/domain/organization/group";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserRecord from "./service/domain/organization/user_record";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
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

interface ExposedGroup {
  groupId: string;
  displayName: string;
  users: UserRecord.Id[];
}

interface Service {
  listGroups(ctx: Ctx, user: ServiceUser): Promise<Result.Type<Group.Group[]>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(`${urlPrefix}/group.list`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const issuer: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

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
        reply.status(code).send(body);
      });
  });
}
