import Joi = require("joi");
import { VError } from "verror";

import { extractUser } from "./handlerUtils";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { UploadedDocumentOrLink, uploadedDocumentSchema } from "./service/domain/document/document";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import * as WorkflowitemUpdated from "./service/domain/workflow/workflowitem_updated";
import { AugmentedFastifyInstance } from "./types";

import { WorkflowitemUpdateServiceInterface } from "./index";

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    workflowitemId: Workflowitem.Id;
    displayName?: string;
    description?: string;
    amountType?: "N/A" | "disbursed" | "allocated";
    amount?: string;
    currency?: string;
    exchangeRate?: string;
    billingDate?: string;
    dueDate?: string;
    documents?: UploadedDocumentOrLink[];
    additionalData?: object;
    tags?: string[];
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    workflowitemId: Workflowitem.idSchema.required(),
  })
    .concat(WorkflowitemUpdated.modificationSchema)
    .keys({ documents: Joi.array().items(uploadedDocumentSchema) })
    .required(),
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
 * Creates the swagger schema for the `/workflowitem.update` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Partially update a workflowitem. Only properties mentioned in the request body are touched, " +
        "others are not affected. The assigned user will be notified about the change.\n" +
        "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
        "The only possible values for 'status' are: 'open' and 'closed'",
      tags: ["workflowitem"],
      summary: "Update a workflowitem",
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
            required: ["workflowitemId", "subprojectId", "projectId"],
            properties: {
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build a classroom" },
              amountType: { type: "string", example: "disbursed" },
              amount: { type: "string", example: "500" },
              currency: { type: "string", example: "EUR" },
              exchangeRate: { type: "string", example: "1.0" },
              billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              dueDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              projectId: { type: "string", example: "3r28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              tags: { type: "array", items: { type: "string", example: "test" } },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    fileName: { type: "string", example: "printout.pdf" },
                    base64: {
                      type: "string",
                      example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
                    },
                    link: {
                      type: "string",
                      example: "https://www.example.com",
                    },
                    linkedFileHash: {
                      type: "string",
                      example: "e41a7hduwdf724fbiq8f23fdi2ufg2ef",
                    },
                    comment: { type: "string", example: "this is a comment" },
                  },
                },
              },
              additionalData: { type: "object" },
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
          401: NotAuthenticated.schema,
        },
      },
    },
  };
}

/**
 * Creates an http handler that handles incoming http requests for the `/workflowitem.update` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: WorkflowitemUpdateServiceInterface,
): void {
  server.register(async function () {
    server.post(`${urlPrefix}/workflowitem.update`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(new VError(bodyResult, "failed to update project"));
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      const { projectId, subprojectId, workflowitemId, ...data } = bodyResult.data;

      service
        .updateWorkflowitem(ctx, user, projectId, subprojectId, workflowitemId, data)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "workflowitem.update failed");
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
          request.log.error({ err }, "Error while updating workflowitem");
          reply.status(code).send(body);
        });
    });
  });
}
