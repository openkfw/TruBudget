import { FastifyInstance } from "fastify";
import { config } from "../config";
import { toHttpError } from "../http_errors";
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { isReady } from "../lib/readiness";
import { approveNewNodeForExistingOrganization } from "../network/controller/approveNewNodeForExistingOrganization";
import { approveNewOrganization } from "../network/controller/approveNewOrganization";
import { declineNode } from "../network/controller/declineNode";
import { getNodeList } from "../network/controller/list";
import { getActiveNodes } from "../network/controller/listActive";
import { registerNode, registerNodeManual } from "../network/controller/registerNode";
import { voteForNetworkPermission } from "../network/controller/vote";
import StorageServiceClient from "../service/Client_storage_service";
import { ConnToken } from "../service/conn";
import { ServiceUser } from "../service/domain/organization/service_user";
import { createBackup } from "../system/createBackup";
import { getVersion } from "../system/getVersion";
import { restoreBackup } from "../system/restoreBackup";
import { AuthenticatedRequest, HttpResponse } from "./lib";
import { getSchema, getSchemaWithoutAuth } from "./schema";

const send = (res, httpResponse: HttpResponse): void => {
  const [code, body] = httpResponse;
  res.status(code).send(body);
};

const handleError = (_req, res, err): void => {
  switch (err.kind) {
    case "NotAuthorized": {
      let message = "Current user is not authorized.";
      if (err.token) {
        message = `User ${err.token?.userId} is not authorized.`;
      }

      logger.error({ err }, message);
      send(res, [
        403,
        {
          apiVersion: "1.0",
          error: {
            code: 403,
            message,
          },
        },
      ]);
      break;
    }
    case "AddressIsInvalid": {
      const message = "The address is invalid.";
      logger.error({ err }, message);
      send(res, [
        400,
        {
          apiVersion: "1.0",
          error: { code: 400, message },
        },
      ]);
      break;
    }

    case "IdentityAlreadyExists": {
      const message = `ID ${err.targetId} already exists.`;
      logger.error({ err }, message);
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message },
        },
      ]);
      break;
    }
    case "ProjectIdAlreadyExists": {
      const message = `The project id ${err.projectId} already exists.`;
      logger.error({ err }, message);
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message },
        },
      ]);
      break;
    }
    case "SubprojectIdAlreadyExists": {
      const message = `The subproject id ${err.subprojectId} already exists.`;
      logger.error({ err }, message);
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message },
        },
      ]);
      break;
    }

    case "ParseError": {
      let message;
      if (err.message !== undefined) {
        message = `Error parsing fields ${err.badKeys.join(", ")}: ${err.message}`;
      } else {
        message = `Missing keys: ${err.badKeys.join(", ")}`;
      }
      logger.error({ err }, message);
      send(res, [400, { apiVersion: "1.0", error: { code: 400, message } }]);
      break;
    }

    case "PreconditionError": {
      const { message } = err;
      logger.error({ err }, message);
      send(res, [412, { apiVersion: "1.0", error: { code: 412, message } }]);
      break;
    }

    case "AuthenticationError": {
      const message = "Authentication failed";
      logger.error({ err }, message);
      send(res, [
        401,
        {
          apiVersion: "1.0",
          error: { code: 401, message },
        },
      ]);
      break;
    }

    case "NotFound": {
      const message = "Not found.";
      logger.error({ err }, message);
      send(res, [
        404,
        {
          apiVersion: "1.0",
          error: { code: 404, message },
        },
      ]);
      break;
    }

    case "FileNotFound": {
      const message = "File not found.";
      logger.error({ err }, message);
      send(res, [
        404,
        {
          apiVersion: "1.0",
          error: { code: 404, message },
        },
      ]);
      break;
    }

    case "CorruptFileError": {
      const message = "File corrupt.";
      logger.error({ err }, message);
      send(res, [
        400,
        {
          apiVersion: "1.0",
          error: { code: 400, message },
        },
      ]);
      break;
    }

    case "UnsupportedMediaType": {
      const message = `Unsupported media type: ${err.contentType}.`;
      logger.error({ err }, message);
      send(res, [
        415,
        {
          apiVersion: "1.0",
          error: { code: 415, message },
        },
      ]);
      break;
    }

    default: {
      // handle RPC errors, too:
      if (err.code === -708) {
        const message = "Not found.";
        logger.error({ err }, message);
        send(res, [
          404,
          {
            apiVersion: "1.0",
            error: { code: 404, message },
          },
        ]);
      } else {
        const { code, body } = toHttpError(err);
        res.status(code).send(body);
      }
    }
  }
};

function ctx(request): Ctx {
  return { requestId: request.id, source: "http" };
}

function issuer(request): ServiceUser {
  const req = request as AuthenticatedRequest;
  return {
    id: req.user.userId,
    groups: req.user.groups,
    address: req.user.address,
    metadata: req.user.metadata,
  };
}

export const registerRoutes = (
  server: FastifyInstance,
  conn: ConnToken,
  urlPrefix: string,
  blockchainHost: string,
  blockchainPort: number,
  storageServiceClient: StorageServiceClient,
  invalidateCache: () => void,
): FastifyInstance => {
  server.register(async function () {
    const multichainClient = conn.multichainClient;

    // ------------------------------------------------------------
    //       system
    // ------------------------------------------------------------

    server.get(
      `${urlPrefix}/readiness`,
      getSchemaWithoutAuth("readiness"),
      async (_request, reply) => {
        if (await isReady(multichainClient)) {
          if (!config.documentFeatureEnabled || (await storageServiceClient.isReady())) {
            return reply.status(200).send("Ready");
          } else {
            return reply.status(504).send("Not ready. Waiting for storage service.");
          }
        } else {
          return reply.status(504).send("Not ready. Waiting for multichain.");
        }
      },
    );

    server.get(`${urlPrefix}/liveness`, getSchemaWithoutAuth("liveness"), (_, reply) => {
      reply.status(200).send(
        JSON.stringify({
          uptime: process.uptime(),
        }),
      );
    });

    server.get(`${urlPrefix}/version`, getSchema(server, "version"), (request, reply) => {
      getVersion(blockchainHost, blockchainPort, multichainClient, storageServiceClient)
        .then((response) => {
          send(reply, response);
        })
        .catch((err) => handleError(request, reply, err));
    });

    // ------------------------------------------------------------
    //       network
    // ------------------------------------------------------------

    server.post(
      `${urlPrefix}/network.registerNode`,
      getSchemaWithoutAuth("registerNode"),
      (request, reply) => {
        registerNode(multichainClient, request as AuthenticatedRequest)
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.post(
      `${urlPrefix}/network.registerNodeManual`,
      getSchema(server, "registerNode"),
      (request, reply) => {
        registerNodeManual(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.post(
      `${urlPrefix}/network.declineNode`,
      getSchema(server, "declineNode"),
      (request, reply) => {
        declineNode(multichainClient, request as AuthenticatedRequest)
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.post(
      `${urlPrefix}/network.voteForPermission`,
      getSchema(server, "voteForPermission"),
      (request, reply) => {
        voteForNetworkPermission(
          conn,
          ctx(request),
          issuer(request),
          request as AuthenticatedRequest,
        )
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.post(
      `${urlPrefix}/network.approveNewOrganization`,
      getSchema(server, "approveNewOrganization"),
      (request, reply) => {
        approveNewOrganization(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.post(
      `${urlPrefix}/network.approveNewNodeForExistingOrganization`,
      getSchema(server, "approveNewNodeForExistingOrganization"),
      (request, reply) => {
        approveNewNodeForExistingOrganization(
          conn,
          ctx(request),
          issuer(request),
          request as AuthenticatedRequest,
        )
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.get(`${urlPrefix}/network.list`, getSchema(server, "networkList"), (request, reply) => {
      getNodeList(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then((response) => send(reply, response))
        .catch((err) => handleError(request, reply, err));
    });

    server.get(
      `${urlPrefix}/network.listActive`,
      getSchema(server, "listActive"),
      (request, reply) => {
        getActiveNodes(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
          .then((response) => send(reply, response))
          .catch((err) => handleError(request, reply, err));
      },
    );

    server.get(
      `${urlPrefix}/system.createBackup`,
      getSchema(server, "createBackup"),
      (req: AuthenticatedRequest, reply) => {
        createBackup(blockchainHost, blockchainPort, req)
          .then((data) => {
            reply.header("Content-Type", "application/gzip");
            reply.header("Content-Disposition", 'attachment; filename="backup.gz"');
            reply.send(data);
          })
          .catch((err) => handleError(req, reply, err));
      },
    );

    server.post(
      `${urlPrefix}/system.restoreBackup`,
      getSchema(server, "restoreBackup"),
      async (req: AuthenticatedRequest, reply) => {
        await restoreBackup(blockchainHost, blockchainPort, req)
          .then((response) => send(reply, response))
          .catch((err) => handleError(req, reply, err));
        // Invalidate the cache, regardless of the outcome:
        await invalidateCache();
      },
    );
  });

  return server;
};
