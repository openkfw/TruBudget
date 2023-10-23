import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { UploadedDocument } from "./service/domain/document/document";
import { ServiceUser } from "./service/domain/organization/service_user";
import { ResourceMap } from "./service/domain/ResourceMap";
import { isoCurrencyCodes } from "./service/domain/workflow/money";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import Type, { workflowitemTypes } from "./service/domain/workflowitem_types/types";
import * as WorkflowitemCreate from "./service/workflowitem_create";
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

/**
 * Creates the swagger schema for the `/subproject.createWorkflowitem` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
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
          apiVersion: {
            type: "string",
            const: "1.0",
            example: "1.0",
            errorMessage: { const: "Invalid Api Version specified" },
          },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["projectId", "subprojectId", "displayName", "amountType"],
            properties: {
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "d0e8c69eg298c87e3899119e025eff1f",
              },
              subprojectId: {
                type: "string",
                format: "subprojectIdFormat",
                example: "er58c69eg298c87e3899119e025eff1f",
              },
              status: { type: "string", const: "open", example: "open" },
              displayName: { type: "string", format: "safeStringFormat", example: "classroom" },
              description: {
                type: "string",
                format: "safeStringWithEmptyFormat",
                example: "build classroom",
              },
              amount: { type: ["string", "null"], format: "moneyAmountFormat", example: "500" },
              assignee: { type: "string", format: "safeIdFormat", example: "aSmith" },
              currency: { type: ["string", "null"], enum: isoCurrencyCodes, example: "EUR" },
              amountType: {
                type: "string",
                enum: ["N/A", "disbursed", "allocated"],
                example: "disbursed",
              },
              billingDate: {
                type: "string",
                format: "safeStringFormat",
                example: "2018-12-11T00:00:00.000Z",
              },
              dueDate: {
                type: "string",
                format: "safeStringWithEmptyFormat",
                example: "2018-12-11T00:00:00.000Z",
              },
              exchangeRate: { type: "string", format: "conversionRateFormat", example: "1.0" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    base64: {
                      type: "string",
                      format: "base64DocumentFormat",
                      example: "dGVzdCBiYXNlNjRTdHJpbmc=",
                      errorMessage: { format: "Document is not valid." },
                    },
                    fileName: { type: "string", example: "test-document" },
                  },
                },
              },
              additionalData: { type: "object", additionalProperties: true },
              workflowitemType: { type: "string", enum: workflowitemTypes, example: "general" },
            },
          },
        },
        errorMessage: "Failed to create workflowitem",
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
): void {
  server.register(async function () {
    server.post(
      `${urlPrefix}/subproject.createWorkflowitem`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const reqBody = request.body as RequestBodyV1;

        const reqData: WorkflowitemCreate.RequestData = {
          projectId: reqBody.data.projectId,
          subprojectId: reqBody.data.subprojectId,
          status: reqBody.data.status,
          displayName: reqBody.data.displayName,
          description: reqBody.data.description,
          assignee: reqBody.data.assignee,
          currency: reqBody.data.currency,
          amount: reqBody.data.amount,
          amountType: reqBody.data.amountType,
          billingDate: reqBody.data.billingDate,
          dueDate: reqBody.data.dueDate,
          exchangeRate: reqBody.data.exchangeRate,
          additionalData: reqBody.data.additionalData,
          documents: reqBody.data.documents,
          workflowitemType: reqBody.data.workflowitemType,
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
  });
}
