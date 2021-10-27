import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { CurrencyCode, currencyCodeSchema } from "./service/domain/workflow/money";
import * as Project from "./service/domain/workflow/project";
import { ProjectedBudget } from "./service/domain/workflow/projected_budget";
import * as Subproject from "./service/domain/workflow/subproject";
import Joi = require("joi");
import { safeStringSchema } from "./lib/joiValidation";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    organization: string;
    currencyCode: CurrencyCode;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    organization: safeStringSchema.required(),
    currencyCode: currencyCodeSchema.required(),
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
        "Remove a projected budget (i.e., a financial commitment) from a given subproject.",
      tags: ["subproject"],
      summary: "For a given subproject, remove a projected budget.",
      security: [{ bearerToken: [] }],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["projectId", "organization", "currencyCode"],
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "d0e8c69e213459013899119e025eff1f" },
              organization: { type: "string", example: "My Goverment Bank" },
              currencyCode: { type: "string", example: "EUR" },
            },
          },
        },
      },
      response: {
        200: {
          description: "Updated projected budgets.",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                subprojectId: { type: "string", example: "d0e8c69e213459013899119e025eff1f" },
                projectedBudgets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      organization: { type: "string", example: "My Goverment Bank" },
                      value: { type: "string", example: "1000500" },
                      currencyCode: { type: "string", example: "EUR" },
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

interface Service {
  deleteProjectedBudget(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    organization: string,
    currencyCode: CurrencyCode,
  ): Promise<Result.Type<ProjectedBudget[]>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(
    `${urlPrefix}/subproject.budget.deleteProjected`,
    mkSwaggerSchema(server),
    (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(
          new VError(bodyResult, "failed to delete projected budget"),
        );
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const { projectId, subprojectId, organization, currencyCode } = bodyResult.data;

      service
        .deleteProjectedBudget(ctx, user, projectId, subprojectId, organization, currencyCode)
        .then((projectedBudgetsResult) => {
          if (Result.isErr(projectedBudgetsResult)) {
            throw new VError(projectedBudgetsResult, "subproject.budget.deleteProjected failed");
          }
          const projectedBudgets = projectedBudgetsResult;
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              projectId,
              subprojectId,
              projectedBudgets,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while deleting projected subproject budget");
          reply.status(code).send(body);
        });
    },
  );
}
