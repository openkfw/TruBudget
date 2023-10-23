import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    base64String: string;
    hash: string;
    id: string;
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    workflowitemId: Workflowitem.Id;
  };
}

/**
 * Creates the swagger schema for the `/workflowitem.validateDocument` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Compares a given document against a given hash value.",
      tags: ["workflowitem"],
      summary: "Validate a document",
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
            required: ["base64String", "hash"],
            additionalProperties: false,
            properties: {
              base64String: {
                type: "string",
                example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
              },
              hash: {
                type: "string",
                example: "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
              },
              id: {
                type: "string",
                example: "test",
              },
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "3r28c69eg298c87e3899119e025eff1f",
              },
              subprojectId: {
                type: "string",
                format: "subprojectIdFormat",
                example: "5t28c69eg298c87e3899119e025eff1f",
              },
              workflowitemId: {
                type: "string",
                format: "workflowitemIdFormat",
                example: "4j28c69eg298c87e3899119e025eff1f",
              },
            },
          },
        },
        errorMessage: "Invalid request",
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
                isIdentical: { type: "boolean", example: true },
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
 * Represents the service that validates a document of a workflowitem
 */
interface Service {
  matches(
    documentBase64: string,
    expectedSHA256: string,
    id: string,
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
  ): Promise<Result.Type<boolean>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/workflowitem.validateDocument` route
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
      `${urlPrefix}/workflowitem.validateDocument`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const {
          base64String: documentBase64,
          hash: expectedSHA256,
          id,
          projectId,
          subprojectId,
          workflowitemId,
        } = (request.body as RequestBodyV1).data;

        service
          .matches(
            documentBase64,
            expectedSHA256,
            id,
            ctx,
            user,
            projectId,
            subprojectId,
            workflowitemId,
          )
          .then((validateWorkflowitemResult) => {
            if (Result.isErr(validateWorkflowitemResult)) {
              throw new VError(validateWorkflowitemResult, "workflowitem.validateDocument failed");
            }
            const isMatch = validateWorkflowitemResult;
            const code = 200;
            const body = {
              apiVersion: "1.0",
              data: { isIdentical: isMatch },
            };
            reply.status(code).send(body);
          })
          .catch((err) => {
            const { code, body } = toHttpError(err);
            request.log.error({ err }, "Error while validating workflowitem document");
            reply.status(code).send(body);
          });
      },
    );
  });
}
