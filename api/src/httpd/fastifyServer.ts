import { FastifyInstance } from "fastify";
import logger from "../lib/logger";
import { isReady } from "../lib/readiness";
import { MultichainClient } from "../multichain";
import { authenticateUser } from "../user/controller/authenticate";
import { AuthenticatedRequest, HttpResponse } from "./lib";
import { Schema } from "./schema";
import { grantAllPermissions } from "../global/controller/grantAllPermissions";
import { grantGlobalPermission } from "../global/controller/grantPermission";
import { getGlobalPermissions } from "../global/controller/listPermissions";
import { revokeGlobalPermission } from "../global/controller/revokePermission";
import { createGroup } from "../global/createGroup";
import { createProject } from "../global/createProject";
import { createUser } from "../global/createUser";
import { addUserToGroup } from "../group/addUser";
import { getGroupList } from "../group/list";
import { removeUserFromGroup } from "../group/removeUser";
import { approveNewNodeForExistingOrganization } from "../network/controller/approveNewNodeForExistingOrganization";
import { approveNewOrganization } from "../network/controller/approveNewOrganization";
import { getNodeList } from "../network/controller/list";
import { getActiveNodes } from "../network/controller/listActive";
import { registerNode } from "../network/controller/registerNode";
import { voteForNetworkPermission } from "../network/controller/vote";
import { getNotificationList } from "../notification/controller/list";
import { markNotificationRead } from "../notification/controller/markRead";
import { assignProject } from "../project/controller/assign";
import { closeProject } from "../project/controller/close";
import { createSubproject } from "../project/controller/createSubproject";
import { grantProjectPermission } from "../project/controller/intent.grantPermission";
import { getProjectPermissions } from "../project/controller/intent.listPermissions";
import { revokeProjectPermission } from "../project/controller/intent.revokePermission";
import { getProjectList } from "../project/controller/list";
import { updateProject } from "../project/controller/update";
import { getProjectDetails } from "../project/controller/viewDetails";
import { getProjectHistory } from "../project/controller/viewHistory";
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
import { getUserList } from "../user/controller/list";
import { assignWorkflowitem } from "../workflowitem/controller/assign";
import { closeWorkflowitem } from "../workflowitem/controller/close";
import { grantWorkflowitemPermission } from "../workflowitem/controller/intent.grantPermission";
import { getWorkflowitemPermissions } from "../workflowitem/controller/intent.listPermissions";
import { revokeWorkflowitemPermission } from "../workflowitem/controller/intent.revokePermission";
import { getWorkflowitemList } from "../workflowitem/controller/list";
import { updateWorkflowitem } from "../workflowitem/controller/update";
import { validateDocument } from "../workflowitem/controller/validateDocument";

const send = (res, httpResponse: HttpResponse) => {
  const [code, body] = httpResponse;
  res.status(code).send(body);
};

const handleError = (req, res, err: any) => {
  logger.debug(err);

  switch (err.kind) {
    case "NotAuthorized":
      send(res, [
        403,
        {
          apiVersion: "1.0",
          error: {
            code: 403,
            message: `User ${req.token.userId} is not authorized.`,
          },
        },
      ]);
      break;

    case "UserAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The user already exists.` },
        },
      ]);
      break;

    case "GroupAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The group already exists.` },
        },
      ]);
      break;

    case "ParseError": {
      let message;
      if (err.message !== undefined) {
        message = `Error parsing fields ${err.badKeys.join(", ")}: ${err.message}`;
      } else {
        message = `Missing keys: ${err.badKeys.join(", ")}`;
      }
      send(res, [400, { apiVersion: "1.0", error: { code: 400, message } }]);
      break;
    }

    case "PreconditionError": {
      const { message } = err;
      send(res, [412, { apiVersion: "1.0", error: { code: 412, message } }]);
      break;
    }

    case "AuthenticationError":
      send(res, [
        401,
        {
          apiVersion: "1.0",
          error: { code: 401, message: "Authentication failed" },
        },
      ]);
      break;

    case "NotFound":
      send(res, [
        404,
        {
          apiVersion: "1.0",
          error: { code: 404, message: "Not found." },
        },
      ]);
      break;

    default:
      // handle RPC errors, too:
      if (err.code === -708) {
        send(res, [
          404,
          {
            apiVersion: "1.0",
            error: { code: 404, message: "Not found." },
          },
        ]);
      } else {
        logger.error(err);
        send(res, [
          500,
          {
            apiVersion: "1.0",
            error: { code: 500, message: "INTERNAL SERVER ERROR" },
          },
        ]);
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
) => {
  server.get(
    "/readiness",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Returns '200 OK' if the API is up and the Multichain service is",
        tags: ["system"],
        summary: "readiness",
        headers: {
          type: "object",
          properties: {
            Authorization: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "string",
          },
          503: {
            description: "Blockchain not ready",
            type: "string",
          },
        },
      },
    } as Schema,
    async (request, reply) => {
      if (await isReady(multichainClient)) {
        reply.status(200).send("OK");
      } else {
        reply.status(503).send("Service unavailable.");
      }
    },
  );

  server.get(
    "/liveness",
    {
      schema: {
        description: "Returns '200 OK' if the API is up.",
        tags: ["system"],
        summary: "liveness",
        response: {
          200: {
            description: "Succesful response",
            type: "string",
          },
        },
      },
    } as Schema,
    async (request, reply) => {
      reply.status(200).send("OK");
    },
  );

  server.post(
    "/user.authenticate",
    {
      schema: {
        description:
          "Authenticate and retrieve a token in return. This token can then be supplied in the " +
          +"HTTP Authorization header, which is expected by most of the other",
        tags: ["user"],
        summary: "authenticate",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: { id: { type: "string" }, password: { type: "string" } },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      dispalyName: { type: "string" },
                      organization: { type: "string" },
                      allowedIntents: { type: "array", items: { type: "string" } },
                      token: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as Schema,
    async (request, reply) => {
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

  server.post(
    "/global.createUser",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a new user.",
        tags: ["global"],
        summary: "createUser",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    dispalyName: { type: "string" },
                    organization: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      dispalyName: { type: "string" },
                      organization: { type: "string" },
                      address: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as Schema,
    async (request, reply) => {
      console.log(request);
      createUser(multichainClient, request, jwtSecret, rootSecret, organizationVaultSecret)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  return server;
};
