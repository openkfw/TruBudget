import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserDisable from "./service/domain/organization/user_disable";
import Joi = require("joi");

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    userId: string;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    userId: safeIdSchema.required(),
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
      description: "Disable an user account",
      tags: ["user"],
      summary: "Disable an user account",
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
            required: ["userId"],
            properties: {
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
  disableUser(
    ctx: Ctx,
    issuer: ServiceUser,
    issuerOrganization: string,
    revokee: UserDisable.RequestData,
  ): Promise<Result.Type<void>>;
}

export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.post(`${urlPrefix}/global.disableUser`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const issuer: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
      address: (request as AuthenticatedRequest).user.address,
    };
    const issuerOrganization: string = (request as AuthenticatedRequest).user.organization;
    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to disable an user"));
      request.log.error({ err: bodyResult }, "Invalid request body");
      reply.status(code).send(body);
      return;
    }

    const revokee = {
      userId: bodyResult.data.userId,
    };

    service
      .disableUser(ctx, issuer, issuerOrganization, revokee)
      .then((result) => {
        if (Result.isErr(result)) throw new VError(result, "global.disableUser failed");
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: {},
        };
        reply.status(code).send(body);
      })
      .catch((err) => {
        const { code, body } = toHttpError(err);
        request.log.error({ err }, "Error while disabling user");
        reply.status(code).send(body);
      });
  });
}
