import { FastifyInstance } from "fastify";
import Joi = require("joi");
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    base64String: string;
    hash: string;
    id: string;
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    workflowitemId: Workflowitem.Id;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    base64String: Joi.string().required(),
    hash: Joi.string().required(),
    id: Joi.string().required(),
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    workflowitemId: Workflowitem.idSchema.required(),
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
      description: "Compares a given document against a given hash value.",
      tags: ["workflowitem"],
      summary: "Validate a document",
      security: [{ bearerToken: [] }],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["base64String", "hash"],
            additionalProperties: false,
            properties: {
              base64String: {
                type: "string",
                example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
              },
              hash: {
                type: "string",
                example: "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
              },
              id: {
                type: "string",
                example: "test",
              },
              projectId: {
                type: "string",
                example: "3r28c69eg298c87e3899119e025eff1f",
              },
              subprojectId: {
                type: "string",
                example: "5t28c69eg298c87e3899119e025eff1f",
              },
              workflowitemId: {
                type: "string",
                example: "4j28c69eg298c87e3899119e025eff1f",
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
                isIdentical: { type: "boolean", example: true },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface Service {
  matches(
    documentBase64: string,
    expectedSHA256: string,
    id: string,
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
  ): Promise<Result.Type<boolean>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(
    `${urlPrefix}/workflowitem.validateDocument`,
    mkSwaggerSchema(server),
    (request, reply) => {
      const bodyResult = validateRequestBody(request.body);
      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(new VError(bodyResult, "invalid request"));
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const {
        base64String: documentBase64,
        hash: expectedSHA256,
        id,
        projectId,
        subprojectId,
        workflowitemId,
      } = bodyResult.data;

      service
        .matches(
          documentBase64,
          expectedSHA256,
          id,
          ctx,
          user,
          projectId,
          subprojectId,
          workflowitemId,
        )
        .then((validateWorkflowitemResult) => {
          if (Result.isErr(validateWorkflowitemResult)) {
            throw new VError(validateWorkflowitemResult, "workflowitem.validateDocument failed");
          }
          const isMatch = validateWorkflowitemResult;
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: { isIdentical: isMatch },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while validating workflowitem document");
          reply.status(code).send(body);
        });
    },
  );
}
