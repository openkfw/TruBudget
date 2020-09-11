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
import { Permissions } from "./service/domain/permissions";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description:
        "List all registered users and groups.\n" +
        "In case of a user the 'organization' property exists" +
        "In case of a group the 'isGroup' property exists with value 'true",
      tags: ["user"],
      summary: "List all registered users",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "object",
          required: ["apiVersion", "data"],
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              required: ["items"],
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["id", "displayName", "isGroup"],
                    properties: {
                      id: { type: "string", example: "aSmith" },
                      displayName: { type: "string", example: "Alice Smith" },
                      organization: { type: "string", example: "Alice's Solutions & Co" },
                      isGroup: { type: "boolean", example: true },
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

interface ExposedIdentity {
  id: string;
  displayName: string;
  organization?: string;
  isGroup: boolean;
  permissions: Permissions;
}

interface Service {
  listUsers(ctx: Ctx, user: ServiceUser): Promise<Result.Type<UserRecord.UserRecord[]>>;
  listGroups(ctx: Ctx, user: ServiceUser): Promise<Result.Type<Group.Group[]>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(`${urlPrefix}/user.list`, mkSwaggerSchema(server), async (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const issuer: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    try {
      const usersResult = await service.listUsers(ctx, issuer);
      if (Result.isErr(usersResult)) {
        throw new VError(usersResult, "user.list failed");
      }
      const users: ExposedIdentity[] = usersResult.map((user) => ({
        id: user.id,
        displayName: user.displayName,
        organization: user.organization,
        isGroup: false,
        permissions: user.permissions,
      }));

      const groupsResult = await service.listGroups(ctx, issuer);
      if (Result.isErr(groupsResult)) throw new VError(groupsResult, "user.list failed");
      const groups: ExposedIdentity[] = groupsResult.map((group) => ({
        id: group.id,
        displayName: group.displayName,
        isGroup: true,
        permissions: group.permissions,
      }));

      const code = 200;
      const body = {
        apiVersion: "1.0",
        data: {
          items: users.concat(groups),
        },
      };
      reply.status(code).send(body);
    } catch (err) {
      const { code, body } = toHttpError(err);
      reply.status(code).send(body);
    }
  });
}
