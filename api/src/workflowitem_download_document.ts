import * as contentDisposition from "content-disposition";
import { RequestGenericInterface } from "fastify";
import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import * as WorkflowitemDocument from "./service/domain/document/document";
import { ServiceUser } from "./service/domain/organization/service_user";
import { extractUser } from "./handlerUtils";
import { AuthenticatedRequest } from "httpd/lib";

/**
 * Creates the swagger schema for the `/workflowitem.downloadDocument` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Download documents attached to workflowitems",
      tags: ["workflowitem"],
      summary: "Download document attached to workflowitem",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
            type: "string",
          },
          workflowitemId: {
            type: "string",
          },
          documentId: {
            type: "string",
          },
        },
      },
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "successful response",
          type: "string",
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that gets a document from a workflowitem
 */
interface Service {
  getDocument(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
    documentId: string,
  ): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>>;
}

/**
 * Sends back an error as a reply if the given resourceId is empty
 *
 * @param reply the reply to the request
 * @param resourceId a resourceId as a string to be checked
 * @returns the message of the error in case an error is returned, undefined otherwise
 */
function sendErrorIfEmpty(reply, resourceParameter): string | undefined {
  if (!isNonemptyString(resourceParameter)) {
    const message = `required query parameter ${resourceParameter} not present (must be non-empty string)`;
    reply.status(400).send({
      apiVersion: "1.0",
      error: {
        code: 400,
        message,
      },
    });

    return message;
  }
  return;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
    workflowitemId: string;
    documentId: string;
  };
}

/**
 * Creates an http handler that handles incoming http requests for the `/workflowitem.downloadDocument` route
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
    server.get<Request>(
      `${urlPrefix}/workflowitem.downloadDocument`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const { projectId, subprojectId, workflowitemId, documentId } = request.query;
        const message =
          sendErrorIfEmpty(reply, projectId) ||
          sendErrorIfEmpty(reply, subprojectId) ||
          sendErrorIfEmpty(reply, workflowitemId) ||
          sendErrorIfEmpty(reply, documentId);

        if (message) {
          request.log.error({ err: message }, "Invalid request body");
          return;
        }

        try {
          const documentResult = await service.getDocument(
            ctx,
            user,
            projectId,
            subprojectId,
            workflowitemId,
            documentId,
          );

          if (Result.isErr(documentResult)) {
            throw new VError(documentResult, "workflowitem.downloadDocument");
          }

          const code = 200;
          reply.headers({
            "Content-Type": "application/octet-stream",
            "Content-Disposition": contentDisposition(documentResult.fileName),
          });

          reply.status(code).send(Buffer.from(documentResult.base64, "base64"));
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while downloading workflowitem document");
          reply.status(code).send(body);
        }
      },
    );
  });
}
