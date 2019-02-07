import { FastifyInstance } from "fastify";

import {
  AllPermissionsGranter,
  AllPermissionsReader,
  AllProjectsReader,
  AllWorkflowitemsReader,
  GlobalPermissionGranter,
  GlobalPermissionRevoker,
  ProjectAndSubprojects,
  ProjectAssigner,
  ProjectCreator,
  ProjectPermissionsGranter,
  ProjectPermissionsReader,
  ProjectReader,
  ProjectUpdater,
  WorkflowitemCloser,
  WorkflowitemUpdater,
} from ".";
import Intent from "../authz/intents";
import { createGroup } from "../global/createGroup";
import { createUser } from "../global/createUser";
import { addUserToGroup } from "../group/addUser";
import { getGroupList } from "../group/list";
import { removeUserFromGroup } from "../group/removeUser";
import logger from "../lib/logger";
import { isReady } from "../lib/readiness";
import { MultichainClient } from "../multichain/Client.h";
import { approveNewNodeForExistingOrganization } from "../network/controller/approveNewNodeForExistingOrganization";
import { approveNewOrganization } from "../network/controller/approveNewOrganization";
import { getNodeList } from "../network/controller/list";
import { getActiveNodes } from "../network/controller/listActive";
import { registerNode } from "../network/controller/registerNode";
import { voteForNetworkPermission } from "../network/controller/vote";
import { getNotificationCounts } from "../notification/controller/count";
import { getNotificationList } from "../notification/controller/list";
import { markMultipleRead } from "../notification/controller/markMultipleRead";
import { markNotificationRead } from "../notification/controller/markRead";
import { getNewestNotifications } from "../notification/controller/poll";
import { closeProject } from "../project/controller/close";
import { createSubproject } from "../project/controller/createSubproject";
import { revokeProjectPermission } from "../project/controller/intent.revokePermission";
import { getProjectHistory } from "../project/controller/viewHistory";
import { User as ProjectUser } from "../project/User";
import { assignSubproject } from "../subproject/controller/assign";
import { closeSubproject } from "../subproject/controller/close";
import { createWorkflowitem } from "../subproject/controller/createWorkflowitem";
import { grantSubprojectPermission } from "../subproject/controller/intent.grantPermission";
import { getSubprojectPermissions } from "../subproject/controller/intent.listPermissions";
import { revokeSubprojectPermission } from "../subproject/controller/intent.revokePermission";
import { getSubprojectList } from "../subproject/controller/list";
import { reorderWorkflowitems } from "../subproject/controller/reorderWorkflowitems";
import { updateSubproject } from "../subproject/controller/update";
import { getSubprojectDetails } from "../subproject/controller/viewDetails";
import { getSubprojectHistory } from "../subproject/controller/viewHistory";
import { createBackup } from "../system/createBackup";
import { getVersion } from "../system/getVersion";
import { restoreBackup } from "../system/restoreBackup";
import { authenticateUser } from "../user/controller/authenticate";
import { getUserList } from "../user/controller/list";
import { assignWorkflowitem } from "../workflowitem/controller/assign";
import { grantWorkflowitemPermission } from "../workflowitem/controller/intent.grantPermission";
import { getWorkflowitemPermissions } from "../workflowitem/controller/intent.listPermissions";
import { revokeWorkflowitemPermission } from "../workflowitem/controller/intent.revokePermission";
import { validateDocument } from "../workflowitem/controller/validateDocument";
import { AuthenticatedRequest, HttpResponse } from "./lib";
import { getSchema, getSchemaWithoutAuth } from "./schema";

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

export const registerRoutes = (
  server: FastifyInstance,
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  organization: string,
  organizationVaultSecret: string,
  urlPrefix: string,
  multichainHost: string,
  backupApiPort: string,
  {
    listProjects,
    getProjectWithSubprojects,
    assignProject,
    updateProject,
    workflowitemLister,
    workflowitemCloser,
    workflowitemUpdater,
    listGlobalPermissions,
    grantGlobalPermission,
    createProject,
    grantAllPermissions,
    revokeGlobalPermission,
    getProjectPermissions,
    grantProjectPermission,
  }: {
    listProjects: AllProjectsReader;
    getProjectWithSubprojects: ProjectReader;
    assignProject: ProjectAssigner;
    updateProject: ProjectUpdater;
    workflowitemLister: AllWorkflowitemsReader;
    workflowitemCloser: WorkflowitemCloser;
    workflowitemUpdater: WorkflowitemUpdater;
    listGlobalPermissions: AllPermissionsReader;
    grantGlobalPermission: GlobalPermissionGranter;
    createProject: ProjectCreator;
    grantAllPermissions: AllPermissionsGranter;
    revokeGlobalPermission: GlobalPermissionRevoker;
    getProjectPermissions: ProjectPermissionsReader;
    grantProjectPermission: ProjectPermissionsGranter;
  },
) => {
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
  //       user
  // ------------------------------------------------------------

  server.post(
    `${urlPrefix}/user.authenticate`,
    getSchemaWithoutAuth("authenticate"),
    (request, reply) => {
      authenticateUser(
        multichainClient,
        request,
        jwtSecret,
        rootSecret,
        organization,
        organizationVaultSecret,
      )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(`${urlPrefix}/user.list`, getSchema(server, "userList"), (request, reply) => {
    getUserList(multichainClient, request as AuthenticatedRequest)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  // ------------------------------------------------------------
  //       global
  // ------------------------------------------------------------
  server.post(
    `${urlPrefix}/global.createUser`,
    getSchema(server, "createUser"),
    (request, reply) => {
      createUser(
        multichainClient,
        request as AuthenticatedRequest,
        jwtSecret,
        rootSecret,
        organizationVaultSecret,
      )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/global.createGroup`,
    getSchema(server, "createGroup"),
    (request, reply) => {
      createGroup(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/global.createProject`,
    getSchema(server, "createProject"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      createProject(token, req.body.data.project)
        .then(
          (): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: {
                created: true,
              },
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/global.listPermissions`,
    getSchema(server, "globalListPermissions"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      listGlobalPermissions(token)
        .then(
          (permissions): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: permissions,
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/global.grantPermission`,
    getSchema(server, "globalGrantPermission"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;

      const intent: Intent = request.body.data.intent;
      const grantee: string = request.body.data.identity;

      return grantGlobalPermission(token, grantee, intent)
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
    `${urlPrefix}/global.grantAllPermissions`,
    getSchema(server, "globalGrantAllPermissions"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;

      const grantee: string = request.body.data.identity;

      return grantAllPermissions(token, grantee)
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
    `${urlPrefix}/global.revokePermission`,
    getSchema(server, "globalRevokePermission"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;

      const intent: Intent = request.body.data.intent;
      const recipient: string = request.body.data.identity;

      return revokeGlobalPermission(token, recipient, intent)
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

  // ------------------------------------------------------------
  //       group
  // ------------------------------------------------------------

  server.get(`${urlPrefix}/group.list`, getSchema(server, "groupList"), (request, reply) => {
    getGroupList(multichainClient, request as AuthenticatedRequest)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  server.post(`${urlPrefix}/group.addUser`, getSchema(server, "addUser"), (request, reply) => {
    addUserToGroup(multichainClient, request as AuthenticatedRequest)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  server.post(
    `${urlPrefix}/group.removeUser`,
    getSchema(server, "removeUser"),
    (request, reply) => {
      removeUserFromGroup(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       project
  // ------------------------------------------------------------

  server.get(`${urlPrefix}/project.list`, getSchema(server, "projectList"), (request, reply) => {
    const req = request as AuthenticatedRequest;
    return listProjects(req.user)
      .then(
        (projects): HttpResponse => [
          200,
          {
            apiVersion: "1.0",
            data: {
              items: projects,
            },
          },
        ],
      )
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  server.get(
    `${urlPrefix}/project.viewDetails`,
    getSchema(server, "projectViewDetails"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      const projectId: string = request.query.projectId;
      return getProjectWithSubprojects(token, projectId)
        .then(
          (projectWithSubprojects: ProjectAndSubprojects): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: projectWithSubprojects,
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/project.assign`,
    getSchema(server, "projectAssign"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      const user: ProjectUser = { id: token.userId, groups: token.groups };
      const projectId: string = request.body.data.projectId;
      const assignee: string = request.body.data.identity;

      return assignProject(token, projectId, assignee)
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
    `${urlPrefix}/project.update`,
    getSchema(server, "projectUpdate"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      const update = request.body.data;
      const projectId = request.body.data.projectId;

      updateProject(token, projectId, update)
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

  server.post(`${urlPrefix}/project.close`, getSchema(server, "projectClose"), (request, reply) => {
    closeProject(multichainClient, request as AuthenticatedRequest)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  server.post(
    `${urlPrefix}/project.createSubproject`,
    getSchema(server, "createSubproject"),
    (request, reply) => {
      createSubproject(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/project.viewHistory`,
    getSchema(server, "projectViewHistory"),
    (request, reply) => {
      getProjectHistory(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/project.intent.listPermissions`,
    getSchema(server, "projectListPermissions"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      const projectId: string = request.query.projectId;

      getProjectPermissions(token, projectId)
        .then(
          (permissions): HttpResponse => [
            200,
            {
              apiVersion: "1.0",
              data: permissions,
            },
          ],
        )
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/project.intent.grantPermission`,
    getSchema(server, "projectGrantPermission"),
    (request, reply) => {
      const req = request as AuthenticatedRequest;
      const token = req.user;
      const projectId: string = request.body.data.projectId;
      const grantee: string = request.body.data.identity;
      const intent: Intent = request.body.data.intent;

      grantProjectPermission(token, projectId, grantee, intent)
        .then(
          (permissions): HttpResponse => [
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
    `${urlPrefix}/project.intent.revokePermission`,
    getSchema(server, "projectRevokePermission"),
    (request, reply) => {
      revokeProjectPermission(multichainClient, request as AuthenticatedRequest)
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
      getSubprojectDetails(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.assign`,
    getSchema(server, "subprojectAssign"),
    (request, reply) => {
      assignSubproject(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.update`,
    getSchema(server, "subprojectUpdate"),
    (request, reply) => {
      updateSubproject(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/subproject.close`,
    getSchema(server, "subprojectClose"),
    (request, reply) => {
      closeSubproject(multichainClient, request as AuthenticatedRequest)
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
      assignWorkflowitem(multichainClient, request as AuthenticatedRequest)
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
    `${urlPrefix}/notification.list`,
    getSchema(server, "notificationList"),
    (request, reply) => {
      getNotificationList(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${urlPrefix}/notification.poll`,
    getSchema(server, "notificationPoll"),
    (request, reply) => {
      getNewestNotifications(multichainClient, request as AuthenticatedRequest)
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
      voteForNetworkPermission(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/network.approveNewOrganization`,
    getSchema(server, "approveNewOrganization"),
    (request, reply) => {
      approveNewOrganization(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${urlPrefix}/network.approveNewNodeForExistingOrganization`,
    getSchema(server, "approveNewNodeForExistingOrganization"),
    (request, reply) => {
      approveNewNodeForExistingOrganization(multichainClient, request as AuthenticatedRequest)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(`${urlPrefix}/network.list`, getSchema(server, "networkList"), (request, reply) => {
    getNodeList(multichainClient, request as AuthenticatedRequest)
      .then(response => send(reply, response))
      .catch(err => handleError(request, reply, err));
  });

  server.get(
    `${urlPrefix}/network.listActive`,
    getSchema(server, "listActive"),
    (request, reply) => {
      getActiveNodes(multichainClient, request as AuthenticatedRequest)
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
