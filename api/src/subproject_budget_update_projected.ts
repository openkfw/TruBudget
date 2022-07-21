import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import {
  CurrencyCode,
  currencyCodeSchema,
  MoneyAmount,
  moneyAmountSchema,
} from "./service/domain/workflow/money";
import * as Project from "./service/domain/workflow/project";
import { ProjectedBudget } from "./service/domain/workflow/projected_budget";
import * as Subproject from "./service/domain/workflow/subproject";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    organization: string;
    currencyCode: CurrencyCode;
    value: MoneyAmount;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    organization: safeStringSchema.required(),
    currencyCode: currencyCodeSchema.required(),
    value: moneyAmountSchema.required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

/**
 * Validates the request body of the http request
 *
 * @param body the request body
 * @returns the request body wrapped in a {@link Result.Type}. Contains either the object or an error
 */
function validateRequestBody(body: unknown): Result.Type<RequestBody> {
  const { error, value } = requestBodySchema.validate(body);
  return !error ? value : error;
}

/**
 * Creates the swagger schema for the `/subproject.budget.updateProjected` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Add or update a projected budget (i.e., a financial commitment) to a given " +
        "subproject. If a budget for the given organization and currency already exists, the " +
        "money assigned to it is replaced with given `value`; otherwise, a new budget " +
        "entry is created.",
      tags: ["subproject"],
      summary: "For a given subproject, add a new budget or update an existing one.",
      security: [{ bearerToken: [] }],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["projectId", "subprojectId", "organization", "value", "currencyCode"],
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "d0e8c69e213459013899119e025eff1f" },
              organization: { type: "string", example: "My Goverment Bank" },
              currencyCode: { type: "string", example: "EUR" },
              value: { type: "string", example: "500" },
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

/**
 * Represents the service that updates the projected budget of a subproject
 */
interface Service {
  updateProjectedBudget(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    organization: string,
    amount: MoneyAmount,
    currencyCode: CurrencyCode,
  ): Promise<Result.Type<ProjectedBudget[]>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/subproject.budget.updateProjected` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.post(
    `${urlPrefix}/subproject.budget.updateProjected`,
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
          new VError(bodyResult, "failed to update projected budget"),
        );
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const { projectId, subprojectId, organization, value, currencyCode } = bodyResult.data;

      service
        .updateProjectedBudget(
          ctx,
          user,
          projectId,
          subprojectId,
          organization,
          value,
          currencyCode,
        )
        .then((projectedBudgetsResult) => {
          if (Result.isErr(projectedBudgetsResult)) {
            throw new VError(projectedBudgetsResult, "subproject.budget.updateProjected failed");
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
          request.log.error({ err }, "Error while updating projected subproject budget");
          reply.status(code).send(body);
        });
    },
  );
}
