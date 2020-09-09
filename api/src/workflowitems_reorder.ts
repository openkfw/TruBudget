import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import { WorkflowitemOrdering } from "./service/domain/workflow/workflowitem_ordering";
import Joi = require("joi");

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    ordering: WorkflowitemOrdering;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    ordering: Joi.array().items(Workflowitem.idSchema).required(),
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
      description:
        "Set a new workflowitem ordering. Workflowitems not included in the list " +
        "will be ordered by their creation time and placed after all explicitly ordered workflowitems.",
      tags: ["subproject"],
      summary: "Reorder the workflowitems of the given subproject",
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
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
              ordering: {
                type: "array",
                items: {
                  type: "string",
                  example: "56z9ki1ca780434a58b0752f3470301",
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
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface Service {
  setWorkflowitemOrdering(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    ordering: WorkflowitemOrdering,
  ): Promise<Result.Type<void>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(
    `${urlPrefix}/subproject.reorderWorkflowitems`,
    mkSwaggerSchema(server),
    (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(
          new VError(bodyResult, "failed to reorder workflowitems"),
        );
        reply.status(code).send(body);
        return;
      }

      const { projectId, subprojectId, ordering } = bodyResult.data;

      service
        .setWorkflowitemOrdering(ctx, user, projectId, subprojectId, ordering)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "subproject.reorderWorkflowitems failed");
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
    },
  );
}
