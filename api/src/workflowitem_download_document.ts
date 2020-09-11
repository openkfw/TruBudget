import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
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

interface Document {
  data: string;
  fileName: string;
}

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
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
    `${urlPrefix}/workflowitem.downloadDocument`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const { projectId, subprojectId, workflowitemId, documentId } = request.query;

      if (
        sendErrorIfEmpty(reply, projectId) ||
        sendErrorIfEmpty(reply, subprojectId) ||
        sendErrorIfEmpty(reply, workflowitemId) ||
        sendErrorIfEmpty(reply, documentId)
      ) {
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
          throw new VError(documentResult, `workflowitem.downloadDocument`);
        }

        const code = 200;
        reply.headers({
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${documentResult.fileName}"`,
        });

        reply.status(code).send(new Buffer(documentResult.base64, "base64"));
      } catch (err) {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
      }
    },
  );
}
