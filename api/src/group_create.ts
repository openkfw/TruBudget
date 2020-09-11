import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { assertUnreachable } from "./lib/assertUnreachable";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import * as GroupCreate from "./service/domain/organization/group_create";
import { ServiceUser } from "./service/domain/organization/service_user";
import Joi = require("joi");

interface Group {
  id: string;
  displayName: string;
  users: string[];
}

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    group: Group;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    group: Joi.object({
      id: Joi.string().required(),
      displayName: Joi.string().required(),
      users: Joi.array().required().items(Joi.string()),
    }).required(),
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
    preValidation: [(server as any).authenticate],
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
          apiVersion: { type: "string", example: "1.0" },
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
                  id: { type: "string", example: "Manager" },
                  displayName: { type: "string", example: "All Manager Group" },
                  users: {
                    type: "array",
                    items: { type: "string", example: "aSmith" },
                  },
                },
              },
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

interface Service {
  createGroup(
    ctx: Ctx,
    user: ServiceUser,
    group: GroupCreate.RequestData,
  ): Promise<Result.Type<Group>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(`${urlPrefix}/global.createGroup`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to create group"));
      reply.status(code).send(body);
      return;
    }

    let invokeService: Promise<Result.Type<Group>>;
    switch (bodyResult.apiVersion) {
      case "1.0": {
        const { id, displayName, users } = bodyResult.data.group;
        invokeService = service.createGroup(ctx, user, { id, displayName, members: users });
        break;
      }
      default:
        // Joi validates only existing apiVersions
        assertUnreachable(bodyResult.apiVersion);
    }

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
      });
  });
}
