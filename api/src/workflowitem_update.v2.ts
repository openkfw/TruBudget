import Joi = require("joi");
import { VError } from "verror";

import { extractUser, parseMultiPartRequest } from "./handlerUtils";
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
interface UpdateWorkflowV2RequestBody {
  apiVersion: "2.0";
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
    fundingOrganization?: string;
  };
}

const requestBodyV2Schema = Joi.object({
  apiVersion: Joi.valid("2.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    workflowitemId: Workflowitem.idSchema.required(),
  })
    .concat(WorkflowitemUpdated.modificationSchema)
    .keys({ documents: Joi.array().items(uploadedDocumentSchema) })
    .required(),
});

type RequestBody = UpdateWorkflowV2RequestBody;
const requestBodySchema = Joi.alternatives([requestBodyV2Schema]);

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
 * Creates the swagger schema for the `/v2/workflowitem.update` endpoint
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
    server.post(
      `${urlPrefix}/v2/workflowitem.update`,
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
          const { code, body } = toHttpError(new VError(bodyResult, "failed to update project"));
          request.log.error({ err: bodyResult }, "Invalid request body");
          reply.status(code).send(body);
          return;
        }

        const { projectId, subprojectId, workflowitemId, ...data } = bodyResult.data;

        try {
          const result = await service.updateWorkflowitem(
            ctx,
            user,
            projectId,
            subprojectId,
            workflowitemId,
            data,
          );

          if (Result.isErr(result)) {
            throw new VError(result, "workflowitem.update failed");
          }

          const response = {
            apiVersion: "2.0",
            data: {},
          };
          reply.status(200).send(response);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while updating workflowitem");
          reply.status(code).send(body);
        }
      },
    );
  });
}
