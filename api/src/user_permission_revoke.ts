import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import Intent, { userIntents } from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserRecord from "./service/domain/organization/user_record";
import Joi = require("joi");

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    userId: UserRecord.Id;
    identity: Identity;
    intent: Intent;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    userId: UserRecord.idSchema.required(),
    identity: safeIdSchema.required(),
    intent: Joi.valid(userIntents).required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Revoke a permission from a user. After this call has returned, the " +
        "user will no longer be able to execute the given intent.",
      tags: ["user"],
      summary: "Revoke a permission from a user or group",
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
            required: ["identity", "intent", "userId"],
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: {
                type: "string",
                enum: userIntents,
                example: "user.intent.listPermissions",
              },
              userId: { type: "string", example: "aSmith" },
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

interface Service {
  revokeUserPermission(
    ctx: Ctx,
    revoker: ServiceUser,
    revokerOrganization: string,
    userId: UserRecord.Id,
    revokee: Identity,
    intent: Intent,
  ): Promise<Result.Type<void>>;
}

export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.post(
    `${urlPrefix}/user.intent.revokePermission`,
    mkSwaggerSchema(server),
    (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const revoker: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };
      const revokerOrganization: string = (request as AuthenticatedRequest).user.organization;

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(
          new VError(bodyResult, "failed to revoke user permission"),
        );
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const { userId, identity: revokee, intent } = bodyResult.data;

      service
        .revokeUserPermission(ctx, revoker, revokerOrganization, userId, revokee, intent)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "user.intent.revokePermission failed");
          }
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {},
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while revoking user permission");
          reply.status(code).send(body);
        });
    },
  );
}
