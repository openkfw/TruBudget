import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { UploadedDocument, uploadedDocumentSchema } from "./service/domain/document/document";
import { ServiceUser } from "./service/domain/organization/service_user";
import { ResourceMap } from "./service/domain/ResourceMap";
import {
  amountTypeSchema,
  conversionRateSchema,
  moneyAmountSchema,
} from "./service/domain/workflow/money";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import Type, { workflowitemTypeSchema } from "./service/domain/workflowitem_types/types";
import * as WorkflowitemCreate from "./service/workflowitem_create";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    status?: "open" | "closed";
    displayName: string;
    description?: string;
    assignee?: string;
    currency?: string;
    amount?: string;
    amountType: "N/A" | "disbursed" | "allocated";
    billingDate?: string;
    dueDate?: string;
    exchangeRate?: string;
    documents?: UploadedDocument[];
    additionalData?: object;
    workflowitemType?: Type;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema,
    subprojectId: Subproject.idSchema,
    status: Joi.valid("open"),
    displayName: safeStringSchema.required(),
    description: safeStringSchema.allow(""),
    assignee: safeStringSchema,
    currency: safeStringSchema,
    amount: moneyAmountSchema,
    amountType: amountTypeSchema.required(),
    billingDate: safeStringSchema,
    dueDate: Joi.string().allow(""),
    exchangeRate: conversionRateSchema,
    documents: Joi.array().items(uploadedDocumentSchema),
    additionalData: Joi.object(),
    workflowitemType: workflowitemTypeSchema,
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
 * Creates the swagger schema for the `/subproject.createWorkflowitem` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance) {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Create a workflowitem and associate it to the given subproject.\n.\n" +
        "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
        "The only possible values for 'status' are: 'open' and 'closed'",
      tags: ["subproject"],
      summary: "Create a workflowitem",
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
            required: ["projectId", "subprojectId", "displayName", "amountType"],
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
              status: { type: "string", example: "open" },
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build classroom" },
              amount: { type: ["string", "null"], example: "500" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: ["string", "null"], example: "EUR" },
              amountType: { type: "string", example: "disbursed" },
              billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              dueDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              exchangeRate: { type: "string", example: "1.0" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    base64: { type: "string", example: "dGVzdCBiYXNlNjRTdHJpbmc=" },
                    fileName: { type: "string", example: "test-document" },
                  },
                },
              },
              additionalData: { type: "object", additionalProperties: true },
              workflowitemType: { type: "string", example: "general" },
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
                workflowitem: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    documents: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "05c22b92-abb1-4f7c-8f6f-7ff5e8a2bfd3" },
                          fileName: { type: "string", example: "test-document" },
                        },
                      },
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
 * Represents the service that creates a workflowitem
 */
interface Service {
  createWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    createRequest: WorkflowitemCreate.RequestData,
  ): Promise<Result.Type<ResourceMap>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/subproject.createWorkflowitem` route
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
    `${urlPrefix}/subproject.createWorkflowitem`,
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
        const { code, body } = toHttpError(new VError(bodyResult, "failed to create workflowitem"));
        reply.status(code).send(body);
        request.log.error({ err: bodyResult }, "Invalid request body");
        return;
      }

      const reqData: WorkflowitemCreate.RequestData = {
        projectId: bodyResult.data.projectId,
        subprojectId: bodyResult.data.subprojectId,
        status: bodyResult.data.status,
        displayName: bodyResult.data.displayName,
        description: bodyResult.data.description,
        assignee: bodyResult.data.assignee,
        currency: bodyResult.data.currency,
        amount: bodyResult.data.amount,
        amountType: bodyResult.data.amountType,
        billingDate: bodyResult.data.billingDate,
        dueDate: bodyResult.data.dueDate,
        exchangeRate: bodyResult.data.exchangeRate,
        additionalData: bodyResult.data.additionalData,
        documents: bodyResult.data.documents,
        workflowitemType: bodyResult.data.workflowitemType,
      };

      service
        .createWorkflowitem(ctx, user, reqData)
        .then((resourceIdsResult) => {
          if (Result.isErr(resourceIdsResult)) {
            throw new VError(resourceIdsResult, "subproject.createWorkflowitem failed");
          }
          const resourceIds = resourceIdsResult;
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              ...resourceIds,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          reply.status(code).send(body);
          request.log.error({ err }, "Error while creating Workflowitem");
        });
    },
  );
}
