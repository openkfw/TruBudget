import { RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { extractUser } from "./handlerUtils";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { Service } from "./service/workflowitem_document_delete";
import { AugmentedFastifyInstance } from "./types";

/**
 * Creates the swagger schema for the `/workflowitem.deleteDocument` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Delete documents attached to open workflowitems",
      tags: ["workflowitem"],
      summary: "Delete document attached to open workflowitem",
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
        204: {
          description: "successful response",
          type: "string",
        },
        401: NotAuthenticated.schema,
      },
    },
  };
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
 * Creates an http handler that handles incoming http requests for the `/workflowitem.deleteDocument` route
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
    server.delete<Request>(
      `${urlPrefix}/workflowitem.deleteDocument`,
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
          const documentResult = await service.deleteDocument(
            ctx,
            user,
            projectId,
            subprojectId,
            workflowitemId,
            documentId,
          );

          if (Result.isErr(documentResult)) {
            throw new VError(documentResult, "workflowitem.deleteDocument");
          }

          reply.status(204).send("NO CONTENT");
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while deleting workflowitem document");
          reply.status(code).send(body);
        }
      },
    );
  });
}
