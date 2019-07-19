import { FastifyInstance } from "fastify";
import Joi = require("joi");
import { VError } from "verror";

import Intent, { globalIntents } from "./authz/intents";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import logger from "./lib/logger";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";
import {
  GlobalPermissions,
  identitiesAuthorizedFor,
} from "./service/domain/workflow/global_permissions";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    identity: Identity;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    identity: Joi.string().required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    schema: {
      description:
        "Grant all available permissions to a user. Useful as a shorthand for creating admin users.",
      tags: ["global"],
      summary: "Grant all permission to a group or user",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["identity"],
            properties: {
              identity: { type: "string", example: "aSmith" },
            },
          },
        },
      },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: { type: "object" },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface Service {
  getGlobalPermissions(ctx: Ctx, user: ServiceUser): Promise<GlobalPermissions>;
  grantGlobalPermissions(
    ctx: Ctx,
    user: ServiceUser,
    userOrganization: string,
    grantee: Identity,
    permission: Intent,
  ): Promise<void>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(
    `${urlPrefix}/global.grantAllPermissions`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const userOrganization: string = (request as AuthenticatedRequest).user.organization;

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(
          new VError(bodyResult, "failed to grant all global permissions"),
        );
        reply.status(code).send(body);
        return;
      }

      const { identity: grantee } = bodyResult.data;

      try {
        const globalPermissions = await service.getGlobalPermissions(ctx, user);

        for (const intent of globalIntents) {
          // A quick check to see if the user is already listed explicitly. In case the
          // user is authorized through her membership in an authorized group, the user
          // ID is still added.
          if (identitiesAuthorizedFor(globalPermissions, intent).includes(user.id)) {
            continue;
          }
          await service.grantGlobalPermissions(ctx, user, userOrganization, grantee, intent);
          logger.debug({ grantee, intent }, "permission granted");
        }

        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: {},
        };
        reply.status(code).send(body);
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
