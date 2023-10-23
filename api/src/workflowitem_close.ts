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
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    workflowitemId: Workflowitem.Id;
    rejectReason: string;
  };
}

/**
 * Creates the swagger schema for the `/workflowitem.close` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Set a workflowitem's status to 'closed' if, and only if, it is the next item to be closed ",
      tags: ["workflowitem"],
      summary: "Close a workflowitem",
      security: [
        {
          bearerToken: [],
        },
      ],
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
            required: ["workflowitemId", "subprojectId", "projectId"],
            properties: {
              projectId: {
                type: "string",
                format: "projectIdFormat",
                example: "4j28c69eg298c87e3899119e025eff1f",
              },
              subprojectId: {
                type: "string",
                format: "subprojectIdFormat",
                example: "er28c69eg298c87e3899119e025eff1f",
              },
              workflowitemId: {
                type: "string",
                format: "workflowitemIdFormat",
                example: "5z28c69eg298c87e3899119e025eff1f",
              },
              rejectReason: {
                type: "string",
                format: "safeStringFormat",
                example: "rejected due to ...",
              },
            },
          },
        },
        errorMessage: "Failed to close worfklowitem",
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
 * Represents the service that closes a workflowitem
 */
interface Service {
  closeWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
    rejectReason?: string,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/workflowitem.close` route
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
    server.post(`${urlPrefix}/workflowitem.close`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const { projectId, subprojectId, workflowitemId, rejectReason } = (
        request.body as RequestBodyV1
      ).data;

      service
        .closeWorkflowitem(ctx, user, projectId, subprojectId, workflowitemId, rejectReason)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "workflowitem.close failed");
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
          request.log.error({ err }, "Error while closing workflowitem");
          reply.status(code).send(body);
        });
    });
  });
}
