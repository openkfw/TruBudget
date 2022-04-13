import * as contentDisposition from "content-disposition";
import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import * as WorkflowitemDocument from "./service/domain/document/document";
import { ServiceUser } from "./service/domain/organization/service_user";

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

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
    `${urlPrefix}/workflowitem.downloadDocument`,
    mkSwaggerSchema(server),
    async (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

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
}
