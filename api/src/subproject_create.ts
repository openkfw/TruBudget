import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema, safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import * as AdditionalData from "./service/domain/additional_data";
import { ServiceUser } from "./service/domain/organization/service_user";
import { ResourceMap } from "./service/domain/ResourceMap";
import { currencyCodeSchema, isoCurrencyCodes } from "./service/domain/workflow/money";
import { idSchema as projectIdSchema } from "./service/domain/workflow/project";
import { projectedBudgetListSchema } from "./service/domain/workflow/projected_budget";
import { idSchema as subProjectIdSchema } from "./service/domain/workflow/subproject";
import WorkflowitemType, {
  workflowitemTypeSchema,
  workflowitemTypes,
} from "./service/domain/workflowitem_types/types";
import * as SubprojectCreate from "./service/subproject_create";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: string;
    subproject: {
      id?: string;
      status?: "open" | "closed";
      displayName: string;
      description?: string;
      assignee?: string;
      validator?: string;
      workflowitemType?: WorkflowitemType;
      currency: string;
      projectedBudgets?: Array<{
        organization: string;
        value: string;
        currencyCode: string;
      }>;
      additionalData?: object;
    };
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: projectIdSchema.required(),
    subproject: Joi.object({
      id: subProjectIdSchema,
      status: Joi.valid("open"),
      displayName: safeStringSchema.required(),
      description: safeStringSchema.allow(""),
      assignee: safeIdSchema,
      validator: safeIdSchema,
      workflowitemType: workflowitemTypeSchema,
      currency: currencyCodeSchema.required(),
      projectedBudgets: projectedBudgetListSchema,
      additionalData: AdditionalData.schema,
    }).required(),
  }).required(),
});

/**
 * Creates the swagger schema for the `/project.createSubproject` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Create a subproject and associate it to the given project.\n.\n" +
        "Note that the only possible values for 'status' are: 'open' and 'closed'",
      tags: ["project"],
      summary: "Create a subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
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
            required: ["projectId", "subproject"],
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subproject: {
                type: "object",
                required: ["displayName", "currency"],
                properties: {
                  id: {
                    type: "string",
                    format: "subprojectIdSchema",
                    example: "d0e8c69eg298c87e3899119e025eff1f",
                  },
                  status: { type: "string", const: "open", example: "open" },
                  displayName: {
                    type: "string",
                    format: "safeStringFormat",
                    example: "townproject",
                  },
                  description: {
                    type: "string",
                    format: "safeStringWithEmptyFormat",
                    example: "A town should be built",
                  },
                  assignee: { type: "string", format: "safeIdFormat", example: "aSmith" },
                  validator: { type: "string", format: "safeIdFormat", example: "aSmith" },
                  workflowitemType: { type: "string", enum: workflowitemTypes, example: "general" },
                  currency: { type: "string", enum: isoCurrencyCodes, example: "EUR" },
                  projectedBudgets: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["organization", "value", "currencyCode"],
                      properties: {
                        organization: { type: "string", example: "My Goverment Bank" },
                        value: { type: "string", format: "moneyAmountFormat", example: "1000000" },
                        currencyCode: { type: "string", enum: isoCurrencyCodes, example: "EUR" },
                      },
                    },
                  },
                  additionalData: { type: "object", additionalProperties: true },
                },
              },
            },
          },
        },
        errorMessage: "Failed to create subproject",
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
                project: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                  },
                },
                subproject: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
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
 * Represents the service that creates a subproject
 */
interface Service {
  createSubproject(
    ctx: Ctx,
    user: ServiceUser,
    createRequest: SubprojectCreate.RequestData,
  ): Promise<Result.Type<ResourceMap>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/project.createSubproject` route
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
      `${urlPrefix}/project.createSubproject`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const reqBody = request.body as RequestBodyV1;

        const reqData: SubprojectCreate.RequestData = {
          projectId: reqBody.data.projectId,
          subprojectId: reqBody.data.subproject.id,
          status: reqBody.data.subproject.status,
          displayName: reqBody.data.subproject.displayName,
          description: reqBody.data.subproject.description,
          assignee: reqBody.data.subproject.assignee,
          validator: reqBody.data.subproject.validator,
          workflowitemType: reqBody.data.subproject.workflowitemType,
          currency: reqBody.data.subproject.currency,
          projectedBudgets: reqBody.data.subproject.projectedBudgets,
          additionalData: reqBody.data.subproject.additionalData,
        };

        service
          .createSubproject(ctx, user, reqData)
          .then((result) => {
            if (Result.isErr(result)) {
              throw new VError(result, "project.createSubproject failed");
            }
            const resourceIds: ResourceMap = result;
            const code = 200;
            const body = {
              apiVersion: "1.0",
              data: { ...resourceIds },
            };
            reply.status(code).send(body);
          })
          .catch((err) => {
            const { code, body } = toHttpError(err);
            reply.status(code).send(body);
            request.log.error(err, "Error while creating Sub-Project");
          });
      },
    );
  });
}
