import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import Intent, { subprojectIntents } from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { safeIdSchema } from "./lib/joiValidation";
import * as Result from "./result";
import { Identity } from "./service/domain/organization/identity";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/project";
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
    identity: Identity;
    intent: Intent;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema.required(),
    subprojectId: Subproject.idSchema.required(),
    identity: safeIdSchema.required(),
    intent: Joi.valid(...subprojectIntents).required(),
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
 * Creates the swagger schema for the `/subproject.intent.revokePermission` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description:
        "Revoke a permission from a user. After this call has returned, the " +
        "user will no longer be able to execute the given intent.",
      tags: ["subproject"],
      summary: "Revoke a permission to a user or group",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            required: ["identity", "projectId", "subprojectId", "intent"],
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "t628c69eg298c87e3899119e025eff1f" },
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
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that revokes subproject permissions
 */
interface Service {
  revokeSubprojectPermission(
    ctx: Ctx,
    user: ServiceUser,
    projectId: Project.Id,
    subprojectId: Project.Id,
    revokee: Identity,
    intent: Intent,
  ): Promise<Result.Type<void>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/subproject.intent.revokePermission` route
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
      `${urlPrefix}/subproject.intent.revokePermission`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const bodyResult = validateRequestBody(request.body);

        if (Result.isErr(bodyResult)) {
          const { code, body } = toHttpError(
            new VError(bodyResult, "failed to revoke project permission"),
          );
          request.log.error({ err: bodyResult }, "Invalid request body");
          reply.status(code).send(body);
          return;
        }

        const { projectId, subprojectId, identity: revokee, intent } = bodyResult.data;

        service
          .revokeSubprojectPermission(ctx, user, projectId, subprojectId, revokee, intent)
          .then((result) => {
            if (Result.isErr(result)) {
              throw new VError(result, "subproject.intent.revokePermission failed");
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
            request.log.error({ err }, "Error while revoking subproject permission");
            reply.status(code).send(body);
          });
      },
    );
  });
}
