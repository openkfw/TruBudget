import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as SystemInformation from "./service/domain/system_information/system_information";
import { extractUser } from "./handlerUtils";

/**
 * Creates the swagger schema for the `/provisioned` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Returns boolean if the multichain was provisioned successfully",
      tags: ["system"],
      summary: "Check if provisioned",
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
              properties: {
                isProvisioned: {
                  type: "boolean",
                  example: "true",
                },
                message: {
                  type: "string",
                  example: "The Multichain has been provisioned successfully",
                },
              },
            },
          },
        },
      },
    },
  };
}

/**
 * Represents the service that gets the provisioning status
 */
interface Service {
  getProvisionStatus(
    ctx: Ctx,
    user: ServiceUser,
  ): Promise<Result.Type<SystemInformation.ProvisioningStatus>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/provisioned` route
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
    server.get(`${urlPrefix}/provisioned`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };
      const user = extractUser(request as AuthenticatedRequest);

      service
        .getProvisionStatus(ctx, user)
        .then((result) => {
          if (Result.isErr(result)) {
            throw new VError(result, "get provisioned status failed");
          }
          const provisioned = result;
          return provisioned;
        })
        .then((provisioned: SystemInformation.ProvisioningStatus) => {
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              isProvisioned: provisioned.isProvisioned,
              message: provisioned.message,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          request.log.error({ err }, "Error while getting provisioning status");
          reply.status(code).send(body);
        });
    });
  });
}
