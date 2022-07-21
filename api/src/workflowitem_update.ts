import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { UploadedDocument, uploadedDocumentSchema } from "./service/domain/document/document";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import * as WorkflowitemUpdated from "./service/domain/workflow/workflowitem_updated";
import * as WorkflowitemUpdate from "./service/workflowitem_update";
import Joi = require("joi");

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
    documents?: UploadedDocument[];
    additionalData?: object;
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
function mkSwaggerSchema(server: AugmentedFastifyInstance) {
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
 * Represents the service that updates a workflowitem
 */
interface Service {
  updateWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
    data: WorkflowitemUpdate.RequestData,
  ): Promise<Result.Type<void>>;
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
  service: Service,
) {
  server.post(`${urlPrefix}/workflowitem.update`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
      address: (request as AuthenticatedRequest).user.address,
    };

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
}
