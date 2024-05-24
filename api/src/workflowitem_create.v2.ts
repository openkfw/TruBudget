import { MultipartFile } from "@fastify/multipart";
import Joi = require("joi");
import { VError } from "verror";

import { extractUser } from "./handlerUtils";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { UploadedDocument, uploadedDocumentSchema } from "./service/domain/document/document";
import {
  amountTypeSchema,
  conversionRateSchema,
  moneyAmountSchema,
} from "./service/domain/workflow/money";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import Type, { workflowitemTypeSchema } from "./service/domain/workflowitem_types/types";
import * as WorkflowitemCreate from "./service/workflowitem_create";
import { AugmentedFastifyInstance } from "./types";

const parseMultiPartFile = async (part: MultipartFile): Promise<any> => {
  const id = "";
  const buffer = await part.toBuffer();
  // TODO downstream functionality expects base64, but we should work with buffer directly
  const base64 = buffer.toString("base64");
  const fileName = part.filename;
  return { id, base64, fileName };
};

const parseMultiPartRequest = async (request: AuthenticatedRequest): Promise<any> => {
  let data = {};
  let uploadedDocuments: any[] = [];
  const parts = request.parts();
  for await (const part of parts) {
    if (part.type === "file") {
      uploadedDocuments.push(await parseMultiPartFile(part));
    } else {
      if (part.fieldname === "apiVersion") {
        continue;
      }
      if (part.value === "null") {
        data[part.fieldname] = undefined;
        continue;
      }
      // TODO what if tags is not empty?
      if (part.fieldname === "tags" && part.value === "") {
        data[part.fieldname] = [];
        continue;
      }
      data[part.fieldname] = part.value;
    }
  }
  data["documents"] = uploadedDocuments;
  return data;
};

/**
 * Represents the request body of the endpoint
 */
interface CreateWorkflowV2RequestBody {
  apiVersion: "2.0";
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
    tags?: string[];
  };
}

const requestBodyV2Schema = Joi.object({
  apiVersion: Joi.valid("2.0").required(),
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
    dueDate: Joi.string().allow("").optional().isoDate(),
    exchangeRate: conversionRateSchema,
    documents: Joi.array().items(uploadedDocumentSchema),
    additionalData: Joi.object(),
    workflowitemType: workflowitemTypeSchema,
    tags: Joi.array().items(safeStringSchema),
  }).required(),
});

type RequestBody = CreateWorkflowV2RequestBody;
const requestBodySchema = requestBodyV2Schema;

/**
 * Validates the request body of the http request
 *
 * @param body the request body
 * @returns the request body wrapped in a {@link Result.Type}. Contains either the object or an error
 */
function validateRequestBody(body: unknown): Result.Type<RequestBody> {
  const { error, value } = requestBodySchema.validate(body, { stripUnknown: true });
  return !error ? value : error;
}

/**
 * Creates the swagger schema for the `/v2/subproject.createWorkflowitem` endpoint
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
      // body: {
      //   type: "object",
      //   properties: {
      //     apiVersion: { type: "string", example: "2.0" },
      //     data: {
      //       type: "object",
      //       additionalProperties: false,
      //       required: ["projectId", "subprojectId", "displayName", "amountType"],
      //       properties: {
      //         projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
      //         subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
      //         status: { type: "string", example: "open" },
      //         displayName: { type: "string", example: "classroom" },
      //         description: { type: "string", example: "build classroom" },
      //         amount: { type: ["string", "null"], example: "500" },
      //         assignee: { type: "string", example: "aSmith" },
      //         currency: { type: ["string", "null"], example: "EUR" },
      //         amountType: { type: "string", example: "disbursed" },
      //         billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
      //         dueDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
      //         exchangeRate: { type: "string", example: "1.0" },
      //         documents: {
      //           type: "array",
      //           items: {
      //             type: "object",
      //             properties: {
      //               base64: { type: "string", example: "dGVzdCBiYXNlNjRTdHJpbmc=" },
      //               fileName: { type: "string", example: "test-document" },
      //             },
      //           },
      //         },
      //         additionalData: { type: "object", additionalProperties: true },
      //         workflowitemType: { type: "string", example: "general" },
      //         tags: { type: "array", items: { type: "string", example: "test" } },
      //       },
      //     },
      //   },
      // },
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "2.0" },
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
 * Creates an http handler that handles incoming http requests for the `/v2/subproject.createWorkflowitem` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: WorkflowitemCreate.Service,
): void {
  server.register(async function () {
    server.post(
      `${urlPrefix}/v2/subproject.createWorkflowitem`,
      mkSwaggerSchema(server),
      async (request: AuthenticatedRequest, reply) => {
        let body = {
          apiVersion: "2.0",
          data: await parseMultiPartRequest(request),
        };

        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const bodyResult = validateRequestBody(body);

        if (Result.isErr(bodyResult)) {
          const { code, body } = toHttpError(
            new VError(bodyResult, "failed to create workflowitem"),
          );
          request.log.error({ err: bodyResult }, "Invalid request body");
          return reply.status(code).send(body);
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
          tags: bodyResult.data.tags,
        };

        try {
          const resourceIdsResult = await service.createWorkflowitem(ctx, user, reqData);
          if (Result.isErr(resourceIdsResult)) {
            throw new VError(resourceIdsResult, "v2/subproject.createWorkflowitem failed");
          }

          const code = 200;
          const body = {
            apiVersion: "2.0",
            data: {
              ...resourceIdsResult,
            },
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          reply.status(code).send(body);
          request.log.error({ err }, "Error while creating Workflowitem");
        }
      },
    );
  });
}
