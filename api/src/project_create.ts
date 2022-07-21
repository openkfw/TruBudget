import { AugmentedFastifyInstance } from "types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema, safeStringSchema } from "./lib/joiValidation";
import * as Result from "./result";
import * as AdditionalData from "./service/domain/additional_data";
import { ServiceUser } from "./service/domain/organization/service_user";
import { ResourceMap } from "./service/domain/ResourceMap";
import * as Project from "./service/domain/workflow/project";
import { projectedBudgetListSchema } from "./service/domain/workflow/projected_budget";
import * as ProjectCreate from "./service/project_create";
import Joi = require("joi");

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    project: {
      id?: string;
      status?: "open" | "closed";
      displayName: string;
      description?: string;
      assignee?: string;
      thumbnail?: string;
      projectedBudgets?: Array<{
        organization: string;
        value: string;
        currencyCode: string;
      }>;
      additionalData?: object;
      tags?: string[];
    };
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    project: Joi.object({
      id: Project.idSchema,
      status: Joi.valid("open"),
      displayName: safeStringSchema.required(),
      description: safeStringSchema.allow(""),
      assignee: safeIdSchema,
      thumbnail: safeStringSchema,
      projectedBudgets: projectedBudgetListSchema,
      additionalData: AdditionalData.schema,
      tags: Joi.array().items(safeStringSchema),
    }).required(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

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
 * Creates the swagger schema for the `/global.createProject` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Create a new project.\n.\n" +
        "Note that the only possible values for 'status' are: 'open' and 'closed'",
      tags: ["global"],
      summary: "Create a new project",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["project"],
            properties: {
              project: {
                type: "object",
                required: ["displayName"],
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  status: { type: "string", example: "open" },
                  displayName: { type: "string", example: "Build a town-project" },
                  description: { type: "string", example: "A town should be built" },
                  assignee: { type: "string", example: "aSmith" },
                  thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                  projectedBudgets: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["organization", "value", "currencyCode"],
                      properties: {
                        organization: { type: "string", example: "My Goverment Bank" },
                        value: { type: "string", example: "1000000" },
                        currencyCode: { type: "string", example: "EUR" },
                      },
                    },
                  },
                  additionalData: { type: "object", additionalProperties: true },
                  tags: { type: "array", items: { type: "string", example: "test" } },
                },
              },
            },
          },
        },
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
                project: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  },
                },
              },
            },
          },
          401: NotAuthenticated.schema,
        },
      },
    },
  };
}

/**
 * Represents the service that creates a project
 */
interface Service {
  createProject(ctx: Ctx, user: ServiceUser, createRequest): Promise<Result.Type<ResourceMap>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.createProject` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
) {
  server.post(`${urlPrefix}/global.createProject`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };

    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
      address: (request as AuthenticatedRequest).user.address,
    };

    const bodyResult = validateRequestBody(request.body);

    if (Result.isErr(bodyResult)) {
      const { code, body } = toHttpError(new VError(bodyResult, "failed to create project"));
      reply.status(code).send(body);
      request.log.error({ err: bodyResult }, "Invalid Request body");
      return;
    }

    const reqData: ProjectCreate.RequestData = bodyResult.data.project;

    service
      .createProject(ctx, user, reqData)
      .then((result) => {
        if (Result.isErr(result)) {
          throw new VError(result, "global.createProject failed");
        }
        const resourceIds = result;
        const code = 200;
        const body = {
          apiVersion: "1.0",
          data: {
            ...resourceIds,
          },
        };
        reply.status(code).send(body);
      })
      .catch((err) => {
        const { code, body } = toHttpError(err);
        reply.status(code).send(body);
        request.log.error(err, "Error while creating Project");
      });
  });
}
