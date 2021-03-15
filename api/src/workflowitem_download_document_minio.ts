import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotFound from "./http_errors/not_found";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import * as WorkflowitemDocument from "./service/domain/workflow/document";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
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
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            properties: {
              secret: {
                type: "string",
              },
            },
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
        404: NotFound.schema,
      },
    },
  };
}

interface Service {
  getDocumentMinio(
    ctx: Ctx,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
    documentId: string,
    secret: string,
  ): Promise<Result.Type<WorkflowitemDocument.UploadedDocument>>;
}

function sendErrorIfEmpty(reply, resourceParameter) {
  if (!isNonemptyString(resourceParameter)) {
    reply.status(400).send({
      apiVersion: "1.0",
      error: {
        code: 400,
        message: `required query parameter ${resourceParameter} not present (must be non-empty string)`,
      },
    });
    return true;
  }
  return false;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
    workflowitemId: string;
    documentId: string;
  };
  Body: {
    apiVersion: string;
    data: {
      secret: string;
    };
  };
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post<Request>(
    `${urlPrefix}/workflowitem.downloadDocumentMinio`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const { projectId, subprojectId, workflowitemId, documentId } = request.query;
      const { secret } = request.body.data;

      if (
        sendErrorIfEmpty(reply, projectId) ||
        sendErrorIfEmpty(reply, subprojectId) ||
        sendErrorIfEmpty(reply, workflowitemId) ||
        sendErrorIfEmpty(reply, documentId) ||
        sendErrorIfEmpty(reply, secret)
      ) {
        return;
      }

      try {
        const documentResult = await service.getDocumentMinio(
          ctx,
          projectId,
          subprojectId,
          workflowitemId,
          documentId,
          secret,
        );

        if (Result.isErr(documentResult)) {
          throw new VError(documentResult, "workflowitem.downloadDocument");
        }

        const code = 200;
        reply.headers({
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${documentResult.fileName}"`,
        });

        reply.status(code).send(Buffer.from(documentResult.base64, "base64"));
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
