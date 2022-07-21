import { AugmentedFastifyInstance } from "types";
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
import { currencyCodeSchema } from "./service/domain/workflow/money";
import { idSchema as projectIdSchema } from "./service/domain/workflow/project";
import { projectedBudgetListSchema } from "./service/domain/workflow/projected_budget";
import { idSchema as subProjectIdSchema } from "./service/domain/workflow/subproject";
import WorkflowitemType, {
  workflowitemTypeSchema,
} from "./service/domain/workflowitem_types/types";
import * as SubprojectCreate from "./service/subproject_create";
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
 * Creates the swagger schema for the `/project.createSubproject` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance) {
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
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["projectId", "subproject"],
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subproject: {
                type: "object",
                required: ["displayName", "currency"],
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  status: { type: "string", example: "open" },
                  displayName: { type: "string", example: "townproject" },
                  description: { type: "string", example: "A town should be built" },
                  assignee: { type: "string", example: "aSmith" },
                  validator: { type: "string", example: "aSmith" },
                  workflowitemType: { type: "string", example: "general" },
                  currency: { type: "string", example: "EUR" },
                  projectedBudgets: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["organization", "value", "currencyCode"],
                      properties: {
                        organization: { type: "string", example: "My Goverment Bank" },
                        value: { type: "string", example: "1000000" },
                        currencyCode: { type: "string", example: "EUR" },
                      },
                    },
                  },
                  additionalData: { type: "object", additionalProperties: true },
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
) {
  server.post(
    `${urlPrefix}/project.createSubproject`,
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
        const { code, body } = toHttpError(new VError(bodyResult, "failed to create subproject"));
        reply.status(code).send(body);
        request.log.error({ err: bodyResult }, "Invalid Request body");
        return;
      }

      const reqData: SubprojectCreate.RequestData = {
        projectId: bodyResult.data.projectId,
        subprojectId: bodyResult.data.subproject.id,
        status: bodyResult.data.subproject.status,
        displayName: bodyResult.data.subproject.displayName,
        description: bodyResult.data.subproject.description,
        assignee: bodyResult.data.subproject.assignee,
        validator: bodyResult.data.subproject.validator,
        workflowitemType: bodyResult.data.subproject.workflowitemType,
        currency: bodyResult.data.subproject.currency,
        projectedBudgets: bodyResult.data.subproject.projectedBudgets,
        additionalData: bodyResult.data.subproject.additionalData,
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
}
