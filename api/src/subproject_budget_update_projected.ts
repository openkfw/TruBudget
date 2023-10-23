import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { CurrencyCode, isoCurrencyCodes, MoneyAmount } from "./service/domain/workflow/money";
import * as Project from "./service/domain/workflow/project";
import { ProjectedBudget } from "./service/domain/workflow/projected_budget";
import * as Subproject from "./service/domain/workflow/subproject";
import { extractUser } from "./handlerUtils";
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

/**
 * Creates the swagger schema for the `/subproject.budget.updateProjected` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
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
          apiVersion: {
            type: "string",
            const: "1.0",
            example: "1.0",
            errorMessage: { const: "Invalid Api Version specified" },
          },
          data: {
            type: "object",
            required: ["projectId", "subprojectId", "organization", "value", "currencyCode"],
            properties: {
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "d0e8c69eg298c87e3899119e025eff1f",
              },
              subprojectId: {
                type: "string",
                format: "subprojectIdFormat",
                example: "d0e8c69e213459013899119e025eff1f",
              },
              organization: {
                type: "string",
                format: "safeStringFormat",
                example: "My Goverment Bank",
              },
              currencyCode: { type: "string", enum: isoCurrencyCodes, example: "EUR" },
              value: { type: "string", format: "moneyAmountFormat", example: "500" },
            },
          },
        },
        errorMessage: "Failed to update projected budget",
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
): void {
  server.register(async function () {
    server.post(
      `${urlPrefix}/subproject.budget.updateProjected`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const { projectId, subprojectId, organization, value, currencyCode } = (
          request.body as RequestBodyV1
        ).data;

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
  });
}
