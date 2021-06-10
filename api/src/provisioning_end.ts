import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import Joi = require("joi");

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {};
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object().empty().required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
    schema: {
      description: "Set the provisioning status to 'end' to the system_information stream",
      tags: ["system"],
      summary: "Set provisioning end flag",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
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
              properties: {},
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface Service {
  endProvisioning(ctx: Ctx, user: ServiceUser): Promise<Result.Type<void>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(`${urlPrefix}/provisioning.end`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to set provisioning.end"));
      reply.status(code).send(body);
      return;
    }

    service
      .endProvisioning(ctx, user)
      .then((result) => {
        if (Result.isErr(result)) {
          throw new VError(result, "provisioning.end failed");
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
        reply.status(code).send(body);
      });
  });
}
