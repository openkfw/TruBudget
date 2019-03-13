import { FastifyInstance } from 'fastify';

import { AllWorkflowitemsReader, WorkflowitemAssigner, WorkflowitemCloser, WorkflowitemUpdater } from '.';
import { Ctx } from '../lib/ctx';
import logger from '../lib/logger';
import { isReady } from '../lib/readiness';
import { approveNewNodeForExistingOrganization } from '../network/controller/approveNewNodeForExistingOrganization';
import { approveNewOrganization } from '../network/controller/approveNewOrganization';
import { getNodeList } from '../network/controller/list';
import { getActiveNodes } from '../network/controller/listActive';
import { registerNode } from '../network/controller/registerNode';
import { voteForNetworkPermission } from '../network/controller/vote';
import { getNotificationCounts } from '../notification/controller/count';
import { markMultipleRead } from '../notification/controller/markMultipleRead';
import { markNotificationRead } from '../notification/controller/markRead';
import { getNewestNotifications } from '../notification/controller/poll';
import { createSubproject } from '../project/controller/createSubproject';
import { ConnToken } from '../service/conn';
import { ServiceUser } from '../service/domain/organization/service_user';
import { assignSubproject } from '../subproject/controller/assign';
import { closeSubproject } from '../subproject/controller/close';
import { createWorkflowitem } from '../subproject/controller/createWorkflowitem';
import { grantSubprojectPermission } from '../subproject/controller/intent.grantPermission';
import { getSubprojectPermissions } from '../subproject/controller/intent.listPermissions';
import { revokeSubprojectPermission } from '../subproject/controller/intent.revokePermission';
import { getSubprojectList } from '../subproject/controller/list';
import { reorderWorkflowitems } from '../subproject/controller/reorderWorkflowitems';
import { updateSubproject } from '../subproject/controller/update';
import { getSubprojectDetails } from '../subproject/controller/viewDetails';
import { getSubprojectHistory } from '../subproject/controller/viewHistory';
import { createBackup } from '../system/createBackup';
import { getVersion } from '../system/getVersion';
import { restoreBackup } from '../system/restoreBackup';
import { grantWorkflowitemPermission } from '../workflowitem/controller/intent.grantPermission';
import { getWorkflowitemPermissions } from '../workflowitem/controller/intent.listPermissions';
import { revokeWorkflowitemPermission } from '../workflowitem/controller/intent.revokePermission';
import { validateDocument } from '../workflowitem/controller/validateDocument';
import { AuthenticatedRequest, HttpResponse } from './lib';
import { getSchema, getSchemaWithoutAuth } from './schema';

const send = (res, httpResponse: HttpResponse) => {
  const [code, body] = httpResponse;
  res.status(code).send(body);
};

const handleError = (req, res, err: any) => {
  switch (err.kind) {
    case "NotAuthorized": {
      const message = `User ${err.token.userId} is not authorized.`;
      logger.debug({ error: err }, message);
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
      const message = `The address is invalid.`;
      logger.error({ error: err }, message);
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
      logger.error({ error: err }, message);
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
      logger.warn({ error: err }, message);
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
      logger.warn({ error: err }, message);
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
      logger.debug({ error: err }, message);
      send(res, [400, { apiVersion: "1.0", error: { code: 400, message } }]);
      break;
    }

    case "PreconditionError": {
      const { message } = err;
      logger.warn({ error: err }, message);
      send(res, [412, { apiVersion: "1.0", error: { code: 412, message } }]);
      break;
    }

    case "AuthenticationError": {
      const message = "Authentication failed";
      logger.debug({ error: err }, message);
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
      logger.debug({ error: err }, message);
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
      logger.debug({ error: err }, message);
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
      logger.error({ error: err }, message);
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
      logger.debug({ error: err }, message);
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
        logger.debug({ error: err }, message);
        send(res, [
          404,
          {
            apiVersion: "1.0",
            error: { code: 404, message },
          },
        ]);
      } else {
        const message = "INTERNAL SERVER ERROR";
        logger.error({ error: err }, message);
        send(res, [
          500,
          {
            apiVersion: "1.0",
            error: { code: 500, message },
          },
        ]);
      }
    }
  }
};

function ctx(request: any): Ctx {
  return { requestId: request.id, source: "http" };
}

function issuer(request: any): ServiceUser {
  const req = request as AuthenticatedRequest;
  return { id: req.user.userId, groups: req.user.groups };
}

export const registerRoutes = (
  server: FastifyInstance,
  conn: ConnToken,
  urlPrefix: string,
  multichainHost: string,
  backupApiPort: string,
  {
    workflowitemLister,
    workflowitemCloser,
    workflowitemUpdater,
    workflowitemAssigner,
  }: {
    workflowitemLister: AllWorkflowitemsReader;
    workflowitemCloser: WorkflowitemCloser;
    workflowitemUpdater: WorkflowitemUpdater;
    workflowitemAssigner: WorkflowitemAssigner;
  },
) => {
  const multichainClient = conn.multichainClient;

  // ------------------------------------------------------------
  //       system
  // ------------------------------------------------------------

  server.get(
    `${urlPrefix}/readiness`,
    getSchemaWithoutAuth("readiness"),
    async (request, reply) => {
      if (await isReady(multichainClient)) {
        return reply.status(200).send("OK");
      } else {
        return reply.status(503).send("Service unavailable.");
      }
    },
  );

  server.get(`${urlPrefix}/liveness`, getSchemaWithoutAuth("liveness"), (_, reply) => {
    reply.status(200).send("OK");
  });

  server.get(`${urlPrefix}/version`, getSchema(server, "version"), async (request, reply) => {
    getVersion(multichainHost, backupApiPort, multichainClient)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  // ------------------------------------------------------------
  //       project
  // ------------------------------------------------------------

  server.post(
    `${urlPrefix}/project.createSubproject`,
    getSchema(server, "createSubproject"),
    (request, reply) => {
      createSubproject(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       subproject
  // ------------------------------------------------------------

  server.get(
    `${urlPrefix}/subproject.list`,
    getSchema(server, "subprojectList"),
    (request, reply) => {
      getSubprojectList(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/subproject.viewDetails`,
    getSchema(server, "subprojectViewDetails"),
    (request, reply) => {
      getSubprojectDetails(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.assign`,
    getSchema(server, "subprojectAssign"),
    (request, reply) => {
      assignSubproject(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.update`,
    getSchema(server, "subprojectUpdate"),
    (request, reply) => {
      updateSubproject(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.close`,
    getSchema(server, "subprojectClose"),
    (request, reply) => {
      closeSubproject(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.reorderWorkflowitems`,
    getSchema(server, "reorderWorkflowitems"),
    (request, reply) => {
      reorderWorkflowitems(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.createWorkflowitem`,
    getSchema(server, "createWorkflowitem"),
    (request, reply) => {
      createWorkflowitem(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/subproject.viewHistory`,
    getSchema(server, "subprojectViewHistory"),
    (request, reply) => {
      getSubprojectHistory(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/subproject.intent.listPermissions`,
    getSchema(server, "subprojectListPermissions"),
    (request, reply) => {
      getSubprojectPermissions(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.intent.grantPermission`,
    getSchema(server, "subprojectGrantPermission"),
    (request, reply) => {
      grantSubprojectPermission(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.intent.revokePermission`,
    getSchema(server, "subprojectRevokePermission"),
    (request, reply) => {
      revokeSubprojectPermission(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       workflowitem
  // ------------------------------------------------------------

  server.get(
    `${urlPrefix}/workflowitem.list`,
    getSchema(server, "workflowitemList"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      return workflowitemLister(req.user, req.query.projectId, req.query.subprojectId)
        .then(
          (workflowitems): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: {
                workflowitems,
              },
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/workflowitem.assign`,
    getSchema(server, "workflowitemAssign"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const body = req.body.data;
      // assignWorkflowitem(multichainClient, request as AuthenticatedRequest)
      workflowitemAssigner(
        req.user,
        body.projectId,
        body.subprojectId,
        body.workflowitemId,
        body.identity,
      )
        .then(
          (): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: "OK",
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/workflowitem.update`,
    getSchema(server, "workflowitemUpdate"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const body = req.body.data;

      workflowitemUpdater(
        req.user,
        body.projectId,
        body.subprojectId,
        body.workflowitemId,
        req.body.data,
      )
        .then(
          (): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: "OK",
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/workflowitem.close`,
    getSchema(server, "workflowitemClose"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const body = req.body.data;
      workflowitemCloser(req.user, body.projectId, body.subprojectId, body.workflowitemId)
        .then(
          (): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: "OK",
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/workflowitem.intent.listPermissions`,
    getSchema(server, "workflowitemListPermissionsSchema"),
    (request, reply) => {
      getWorkflowitemPermissions(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/workflowitem.intent.grantPermission`,
    getSchema(server, "workflowitemGrantPermissions"),
    (request, reply) => {
      grantWorkflowitemPermission(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/workflowitem.intent.revokePermission`,
    getSchema(server, "workflowitemRevokePermissions"),
    (request, reply) => {
      revokeWorkflowitemPermission(
        multichainClient,
        (request as AuthenticatedRequest) as AuthenticatedRequest,
      )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/workflowitem.validateDocument`,
    getSchema(server, "validateDocument"),
    (request, reply) => {
      validateDocument(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       notification
  // ------------------------------------------------------------

  server.get(
    `${urlPrefix}/notification.poll`,
    getSchema(server, "notificationPoll"),
    (request, reply) => {
      getNewestNotifications(conn, ctx(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/notification.counts`,
    getSchema(server, "notificationCount"),
    (request, reply) => {
      getNotificationCounts(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/notification.markRead`,
    getSchema(server, "markRead"),
    (request, reply) => {
      markNotificationRead(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/notification.markMultipleRead`,
    getSchema(server, "markMultipleRead"),
    (request, reply) => {
      markMultipleRead(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       network
  // ------------------------------------------------------------

  server.post(
    `${urlPrefix}/network.registerNode`,
    getSchemaWithoutAuth("registerNode"),
    (request, reply) => {
      registerNode(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/network.voteForPermission`,
    getSchema(server, "voteForPermission"),
    (request, reply) => {
      voteForNetworkPermission(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/network.approveNewOrganization`,
    getSchema(server, "approveNewOrganization"),
    (request, reply) => {
      approveNewOrganization(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
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
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(`${urlPrefix}/network.list`, getSchema(server, "networkList"), (request, reply) => {
    getNodeList(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  server.get(
    `${urlPrefix}/network.listActive`,
    getSchema(server, "listActive"),
    (request, reply) => {
      getActiveNodes(conn, ctx(request), issuer(request), request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/system.createBackup`,
    getSchema(server, "createBackup"),
    (req: AuthenticatedRequest, reply) => {
      createBackup(multichainHost, backupApiPort, req)
        .then(data => {
          logger.info(reply.res);
          reply.header("Content-Type", "application/gzip");
          reply.header("Content-Disposition", `attachment; filename="backup.gz"`);
          reply.send(data);
        })
        .catch(err => handleError(req, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/system.restoreBackup`,
    getSchema(server, "restoreBackup"),
    (req: AuthenticatedRequest, reply) => {
      restoreBackup(multichainHost, backupApiPort, req)
        .then(response => send(reply, response))
        .catch(err => handleError(req, reply, err));
    },
  );

  return server;
};
