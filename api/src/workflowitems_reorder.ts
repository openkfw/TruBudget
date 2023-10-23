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
import { WorkflowitemOrdering } from "./service/domain/workflow/workflowitem_ordering";
import { extractUser } from "./handlerUtils";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    ordering: WorkflowitemOrdering;
  };
}

/**
 * Creates the swagger schema for the `/subproject.reorderWorkflowitems` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Set a new workflowitem ordering. Workflowitems not included in the list " +
        "will be ordered by their creation time and placed after all explicitly ordered workflowitems.",
      tags: ["subproject"],
      summary: "Reorder the workflowitems of the given subproject",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: {
            type: "string",
            const: "1.0",
            example: "1.0",
            errorMessage: { const: "Invalid Api Version specified" },
          },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "d0e8c69eg298c87e3899119e025eff1f",
              },
              subprojectId: {
                type: "string",
                format: "subprojectIdFormat",
                example: "er58c69eg298c87e3899119e025eff1f",
              },
              ordering: {
                type: "array",
                items: {
                  type: "string",
                  format: "workflowitemIdFormat",
                  example: "56z9ki1ca780434a58b0752f3470301",
                },
              },
            },
          },
        },
        errorMessage: "Failed to reorder workflowitems",
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
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that sets the workflowitems reordering
 */
interface Service {
  setWorkflowitemOrdering(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    ordering: WorkflowitemOrdering,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/subproject.reorderWorkflowitems` route
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
      `${urlPrefix}/subproject.reorderWorkflowitems`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const { projectId, subprojectId, ordering } = (request.body as RequestBodyV1).data;

        service
          .setWorkflowitemOrdering(ctx, user, projectId, subprojectId, ordering)
          .then((result) => {
            if (Result.isErr(result)) {
              throw new VError(result, "subproject.reorderWorkflowitems failed");
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
            request.log.error({ err }, "Error while reordering workflowitems");
            reply.status(code).send(body);
          });
      },
    );
  });
}
