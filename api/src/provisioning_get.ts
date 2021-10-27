import { FastifyInstance } from "fastify";
import { VError } from "verror";
import { toHttpError } from "./http_errors";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as SystemInformation from "./service/domain/system_information/system_information";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
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

interface Service {
  getProvisionStatus(
    ctx: Ctx,
    user: ServiceUser,
  ): Promise<Result.Type<SystemInformation.ProvisioningStatus>>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get(`${urlPrefix}/provisioned`, mkSwaggerSchema(server), (request, reply) => {
    const ctx: Ctx = { requestId: request.id, source: "http" };
    const user: ServiceUser = {
      id: (request as AuthenticatedRequest).user.userId,
      groups: (request as AuthenticatedRequest).user.groups,
      address: (request as AuthenticatedRequest).user.address,
    };

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
}
