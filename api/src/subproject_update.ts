import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import * as AdditionalData from "./service/domain/additional_data";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as ProjectUpdate from "./service/domain/workflow/project_update";
import * as Subproject from "./service/domain/workflow/subproject";
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
    displayName?: string;
    description?: string;
    additionalData?: object;
    currency?: object;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    displayName: safeStringSchema,
    description: safeStringSchema.allow(""),
    additionalData: AdditionalData.schema,
  }).required(),
});

/**
 * Creates the swagger schema for the `/subproject.update` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Partially update a subproject. Only properties mentioned in the request body are touched, " +
        "others are not affected. The assigned user will be notified about the change.",
      tags: ["subproject"],
      summary: "Update a subproject",
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
            required: ["projectId", "subprojectId"],
            properties: {
              displayName: { type: "string", format: "safeStringFormat", example: "school" },
              description: {
                type: "string",
                format: "safeStringWithEmptyFormat",
                example: "school should be built",
              },
              additionalData: { type: "object" },
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
            },
          },
        },
        errorMessage: "Failed to update project",
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
 * Represents the service that updates a subproject
 */
interface Service {
  updateSubproject(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    requestData: ProjectUpdate.RequestData,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/subproject.update` route
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
    server.post(`${urlPrefix}/subproject.update`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user = extractUser(request as AuthenticatedRequest);

      const reqBody = request.body as RequestBodyV1;
      const { projectId, subprojectId } = reqBody.data;
      const reqData = {
        displayName: reqBody.data.displayName,
        description: reqBody.data.description,
        additionalData: reqBody.data.additionalData,
      };

      service
        .updateSubproject(ctx, user, projectId, subprojectId, reqData)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "subproject.update failed");
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
          request.log.error({ err }, "Error while updating subproject");
          reply.status(code).send(body);
        });
    });
  });
}
