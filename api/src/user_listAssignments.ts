import { RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { UserAssignments } from "./service/domain/workflow/user_assignments";
import { RequestData } from "./service/domain/workflow/user_assignments_get";
import { AugmentedFastifyInstance } from "./types";

/**
 * Creates the swagger schema for the `/global.listAssignments` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "See the assignments for a given user.",
      tags: ["user"],
      summary: "List all assignments",
      querystring: {
        type: "object",
        properties: {
          userId: {
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
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              additionalProperties: true,
              projects: [],
              subprojects: [],
              workflowitem: [],
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that gets user assignments
 */
interface Service {
  getUserAssignments(
    ctx: Ctx,
    issuer: ServiceUser,
    issuerOrganization: string,
    requestData: RequestData,
  ): Promise<Result.Type<UserAssignments>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    userId: string;
  };
}

/**
 * Creates an http handler that handles incoming http requests for the `/global.listAssignments` route
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
      `${urlPrefix}/global.listAssignments`,
      mkSwaggerSchema(server),
      async (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };
        const issuer: ServiceUser = {
          id: (request as AuthenticatedRequest).user.userId,
          groups: (request as AuthenticatedRequest).user.groups,
          address: (request as AuthenticatedRequest).user.address,
        };

        const requestData: RequestData = { userId: request.query.userId };
        const issuerOrganization: string = (request as AuthenticatedRequest).user.organization;

        if (!isNonemptyString(requestData.userId)) {
          const message =
            "required query parameter `userId` not present (must be non-empty string)";
          reply.status(404).send({
            apiVersion: "1.0",
            error: {
              code: 404,
              message,
            },
          });
          request.log.error({ err: message }, "Invalid request body");
          return;
        }

        try {
          const userAssignmentsResult = await service.getUserAssignments(
            ctx,
            issuer,
            issuerOrganization,
            requestData,
          );
          if (Result.isErr(userAssignmentsResult)) {
            throw new VError(userAssignmentsResult, "global.listAssignments failed");
          }
          const userAssignments = userAssignmentsResult;
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: userAssignments,
          };
          reply.status(code).send(body);
        } catch (err) {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while listing assignments of user");
          reply.status(code).send(body);
        }
      },
    );
  });
}
