import { FastifyInstance } from "fastify";
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
import logger from "../lib/logger";
import { isReady } from "../lib/readiness";
import { MultichainClient } from "../multichain";
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
import { authenticateUser } from "../user/controller/authenticate";
import { getUserList } from "../user/controller/list";
import { assignWorkflowitem } from "../workflowitem/controller/assign";
import { closeWorkflowitem } from "../workflowitem/controller/close";
import { grantWorkflowitemPermission } from "../workflowitem/controller/intent.grantPermission";
import { getWorkflowitemPermissions } from "../workflowitem/controller/intent.listPermissions";
import { revokeWorkflowitemPermission } from "../workflowitem/controller/intent.revokePermission";
import { getWorkflowitemList } from "../workflowitem/controller/list";
import { updateWorkflowitem } from "../workflowitem/controller/update";
import { validateDocument } from "../workflowitem/controller/validateDocument";
import { HttpResponse } from "./lib";
import { Schema } from "./schema";

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

function getAuthErrorSchema() {
  return {
    description: "Unauthorized request",
    type: "object",
    properties: {
      apiVersion: { type: "string" },
      error: {
        type: "object",
        properties: {
          code: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  };
}

export const registerRoutes = (
  server: FastifyInstance,
  multichainClient: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  organization: string,
  organizationVaultSecret: string,
) => {
  // ------------------------------------------------------------
  //       system
  // ------------------------------------------------------------

  server.get(
    "/readiness",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Returns '200 OK' if the API is up and the Multichain service is reachable. " +
          "'503 Service unavailable.' otherwise.",
        tags: ["system"],
        summary: "Check if the Multichain is reachable",
        response: {
          200: {
            description: "Succesful response",
            type: "string",
          },
          401: getAuthErrorSchema(),
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
        summary: "Check if the API is up",
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

  // ------------------------------------------------------------
  //       user
  // ------------------------------------------------------------

  server.post(
    "/user.authenticate",
    {
      schema: {
        description:
          "Authenticate and retrieve a token in return. This token can then be supplied in the " +
          +"HTTP Authorization header, which is expected by most of the other",
        tags: ["user"],
        summary: "Authenticate with user and password",
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
            description: "Succesful response",
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
          401: getAuthErrorSchema(),
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

  server.get(
    "/user.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "List all registered users.",
        tags: ["user"],
        summary: "List all registered users",
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        displayName: { type: "string" },
                        organization: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getUserList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       global
  // ------------------------------------------------------------
  server.post(
    "/global.createUser",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a new user.",
        tags: ["global"],
        summary: "Create a user",
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
            description: "Succesful response",
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
          401: getAuthErrorSchema(),
          409: {
            description: "User already exists",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
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

  server.post(
    "/global.createGroup",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a new group.",
        tags: ["global"],
        summary: "Create a new group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                group: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    dispalyName: { type: "string" },
                    users: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  created: { type: "string" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
          409: {
            description: "Group already exists",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    } as Schema,
    async (request, reply) => {
      createGroup(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/global.createProject",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a new project.",
        tags: ["global"],
        summary: "Create a new project",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                project: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    status: { type: "string" },
                    displayName: { type: "string" },
                    description: { type: "string" },
                    iamountd: { type: "string" },
                    assignee: { type: "string" },
                    currency: { type: "string" },
                    thumbnail: { type: "string" },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  created: { type: "string" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      createProject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/global.listPermissions",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the current global permissions.",
        tags: ["global"],
        summary: "List all existing permissions",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getGlobalPermissions(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/global.grant permission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant the right to execute a specific intent on the Global scope to a given user.",
        tags: ["global"],
        summary: "Grant a permission to a group or user",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      grantGlobalPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/global.grantAllPermissions",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant all available permissions to a user. Useful as a shorthand for creating admin users.",
        tags: ["global"],
        summary: "Grant all permission to a group or user",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      grantAllPermissions(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/global.revokePermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke the right to execute a specific intent on the Global scope to a given user.",
        tags: ["global"],
        summary: "Revoke a permission from a group or user",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      revokeGlobalPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       group
  // ------------------------------------------------------------

  server.get(
    "/group.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "List all user groups.",
        tags: ["group"],
        summary: "List all existing groups",
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        groupId: { type: "string" },
                        displayName: { type: "string" },
                        users: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getGroupList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/group.addUser",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Add user to a group",
        tags: ["group"],
        summary: "Add a user to a group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                groupId: { type: "string" },
                userId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  added: { type: "boolean" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      addUserToGroup(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/group.removeUser",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Remove user from a group",
        tags: ["group"],
        summary: "Remove a user from a group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                groupId: { type: "string" },
                userId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  deleted: { type: "boolean" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      removeUserFromGroup(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       project
  // ------------------------------------------------------------

  server.get(
    "/project.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Retrieve all projects the user is allowed to see.",
        tags: ["project"],
        summary: "List all projects",
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            creationUnixTs: { type: "string" },
                            status: { type: "string" },
                            displayName: { type: "string" },
                            description: { type: "string" },
                            amount: { type: "string" },
                            assignee: { type: "string" },
                            currency: { type: "string" },
                            thumbnail: { type: "string" },
                          },
                        },
                        log: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              key: { type: "string" },
                              intent: { type: "string" },
                              createdBy: { type: "string" },
                              createdAt: { type: "string" },
                              dataVersion: { type: "string" },
                              data: {
                                type: "object",
                                properties: {
                                  project: {
                                    type: "object",
                                    properties: {
                                      id: { type: "string" },
                                      creationUnixTs: { type: "string" },
                                      status: { type: "string" },
                                      displayName: { type: "string" },
                                      description: { type: "string" },
                                      amount: { type: "string" },
                                      assignee: { type: "string" },
                                      currency: { type: "string" },
                                      thumbnail: { type: "string" },
                                    },
                                  },
                                  permissions: { type: "object", additionalProperties: true },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: { type: "string" },
                                  },
                                },
                              },
                            },
                          },
                        },
                        allowedIntents: { type: "array", items: { type: "string" } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getProjectList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/project.viewDetails",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Retrieve details about a specific project.",
        tags: ["project"],
        summary: "View details",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  project: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          creationUnixTs: { type: "string" },
                          status: { type: "string" },
                          displayName: { type: "string" },
                          description: { type: "string" },
                          amount: { type: "string" },
                          assignee: { type: "string" },
                          currency: { type: "string" },
                          thumbnail: { type: "string" },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string" },
                            createdBy: { type: "string" },
                            createdAt: { type: "string" },
                            dataVersion: { type: "string" },
                            data: {
                              type: "object",
                              properties: {
                                project: {
                                  type: "object",
                                  properties: {
                                    id: { type: "string" },
                                    creationUnixTs: { type: "string" },
                                    status: { type: "string" },
                                    displayName: { type: "string" },
                                    description: { type: "string" },
                                    amount: { type: "string" },
                                    assignee: { type: "string" },
                                    currency: { type: "string" },
                                    thumbnail: { type: "string" },
                                  },
                                },
                                permissions: { type: "object", additionalProperties: true },
                              },
                              snapshot: {
                                type: "object",
                                properties: {
                                  displayName: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getProjectDetails(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/project.assign",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Assign a project to a given user. The assigned user will be notified about the change.",
        tags: ["project"],
        summary: "Assign a user or group to a project",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                projectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      assignProject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/project.update",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Partially update a project. Only properties mentioned in the request body are touched, " +
          "others are not affected. The assigned user will be notified about the change.",
        tags: ["project"],
        summary: "Update a project",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                displayName: { type: "string" },
                description: { type: "string" },
                projectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      updateProject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/project.close",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Set a project's status to 'closed' if, and only if, all associated " +
          "subprojects are already set to 'closed'.",
        tags: ["project"],
        summary: "Close a project",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      closeProject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/project.createSubproject",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a subproject and associate it to the given project.",
        tags: ["project"],
        summary: "Create a subproject",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                subproject: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    status: { type: "string" },
                    displayName: { type: "string" },
                    description: { type: "string" },
                    amount: { type: "string" },
                    assignee: { type: "string" },
                    currency: { type: "string" },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  created: { type: "string" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      createSubproject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/project.viewHistory",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "View the history of a given project (filtered by what the user is allowed to see).",
        tags: ["project"],
        summary: "View history",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        intent: { type: "string" },
                        createdBy: { type: "string" },
                        createdAt: { type: "string" },
                        dataVersion: { type: "string" },
                        data: {
                          type: "object",
                          additionalProperties: true,
                          properties: {
                            permissions: { type: "object", additionalProperties: true },
                          },
                          snapshot: {
                            type: "object",
                            properties: {
                              displayName: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getProjectHistory(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/project.intent.listPermissions",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the permissions for a given project.",
        tags: ["project"],
        summary: "List all permissions",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getProjectPermissions(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/project.intent.grantPermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant a permission to a user. After this call has returned, the " +
          "user will be allowed to execute the given intent.",
        tags: ["project"],
        summary: "Grant a permission to a user or group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
                projectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      grantProjectPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/project.intent.revokePermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke a permission from a user. After this call has returned, the " +
          "user will no longer be able to execute the given intent.",
        tags: ["project"],
        summary: "Revoke a permission from a user or group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
                projectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      revokeProjectPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       subproject
  // ------------------------------------------------------------

  server.get(
    "/subproject.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Retrieve all subprojects for a given project. Note that any " +
          "subprojects the user is not allowed to see are left out of the response.",
        tags: ["subproject"],
        summary: "List all subprojects of a given project",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            creationUnixTs: { type: "string" },
                            status: { type: "string" },
                            displayName: { type: "string" },
                            description: { type: "string" },
                            amount: { type: "string" },
                            assignee: { type: "string" },
                            currency: { type: "string" },
                            thumbnail: { type: "string" },
                          },
                        },
                        log: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              key: { type: "string" },
                              intent: { type: "string" },
                              createdBy: { type: "string" },
                              createdAt: { type: "string" },
                              dataVersion: { type: "string" },
                              data: {
                                type: "object",
                                properties: {
                                  subproject: {
                                    type: "object",
                                    properties: {
                                      id: { type: "string" },
                                      creationUnixTs: { type: "string" },
                                      status: { type: "string" },
                                      displayName: { type: "string" },
                                      description: { type: "string" },
                                      amount: { type: "string" },
                                      assignee: { type: "string" },
                                      currency: { type: "string" },
                                      thumbnail: { type: "string" },
                                    },
                                  },
                                  permissions: { type: "object", additionalProperties: true },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: { type: "string" },
                                  },
                                },
                              },
                            },
                          },
                        },
                        allowedIntents: { type: "array", items: { type: "string" } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getSubprojectList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/subproject.viewDetails",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Retrieve details about a specific subproject.",
        tags: ["subproject"],
        summary: "View details",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
            subprojectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  subproject: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          creationUnixTs: { type: "string" },
                          status: { type: "string" },
                          displayName: { type: "string" },
                          description: { type: "string" },
                          amount: { type: "string" },
                          assignee: { type: "string" },
                          currency: { type: "string" },
                          thumbnail: { type: "string" },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string" },
                            createdBy: { type: "string" },
                            createdAt: { type: "string" },
                            dataVersion: { type: "string" },
                            data: {
                              type: "object",
                              properties: {
                                subproject: {
                                  type: "object",
                                  properties: {
                                    id: { type: "string" },
                                    creationUnixTs: { type: "string" },
                                    status: { type: "string" },
                                    displayName: { type: "string" },
                                    description: { type: "string" },
                                    amount: { type: "string" },
                                    assignee: { type: "string" },
                                    currency: { type: "string" },
                                    thumbnail: { type: "string" },
                                  },
                                },
                                permissions: { type: "object", additionalProperties: true },
                              },
                              snapshot: {
                                type: "object",
                                properties: {
                                  displayName: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getSubprojectDetails(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.assign",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Assign a subproject to a given user. The assigned user will be notified about the change.",
        tags: ["subproject"],
        summary: "Assign a user or group to a subproject",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      assignSubproject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.update",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Partially update a subproject. Only properties mentioned in the request body are touched, " +
          "others are not affected. The assigned user will be notified about the change.",
        tags: ["subproject"],
        summary: "Update a subproject",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                displayName: { type: "string" },
                description: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      updateSubproject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.close",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Set a subproject's status to 'closed' if, and only if, all " +
          "associated workflowitems are already set to 'closed'.",
        tags: ["subproject"],
        summary: "Close a subproject",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                subprojectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      closeSubproject(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.reorderWorkflowitems",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Set a new workflowitem ordering. Workflowitems not included in the list " +
          "will be ordered by their creation time and placed after all explicitly ordered workflowitems.",
        tags: ["subproject"],
        summary: "Reorder the workflowitems of the given subproject",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                ordering: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      reorderWorkflowitems(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.createWorkflowitem",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a workflowitem and associate it to the given subproject.",
        tags: ["subproject"],
        summary: "Create a workflowitem",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                subproject: { type: "string" },

                status: { type: "string" },
                displayName: { type: "string" },
                description: { type: "string" },
                amount: { type: "string" },
                assignee: { type: "string" },
                currency: { type: "string" },
                amountType: { type: "string" },
                documents: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      base64: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  created: { type: "string" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      createWorkflowitem(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/subproject.viewHistory",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "View the history of a given subproject (filtered by what the user is allowed to see).",
        tags: ["subproject"],
        summary: "View history",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
            subprojectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        intent: { type: "string" },
                        createdBy: { type: "string" },
                        createdAt: { type: "string" },
                        dataVersion: { type: "string" },
                        data: {
                          type: "object",
                          additionalProperties: true,
                          properties: {
                            permissions: { type: "object", additionalProperties: true },
                          },
                          snapshot: {
                            type: "object",
                            properties: {
                              displayName: { type: "string" },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getSubprojectHistory(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/subproject.intent.listPermissions",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the permissions for a given subproject.",
        tags: ["subproject"],
        summary: "List all permissions",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
            subprojectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getSubprojectPermissions(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.intent.grantPermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant a permission to a user. After this call has returned, the " +
          "user will be allowed to execute the given intent.",
        tags: ["subproject"],
        summary: "Grant a permission to a user or group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      grantSubprojectPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/subproject.intent.revokePermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke a permission from a user. After this call has returned, the " +
          "user will no longer be able to execute the given intent.",
        tags: ["subproject"],
        summary: "Revoke a permission to a user or group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      revokeSubprojectPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       workflowitem
  // ------------------------------------------------------------

  server.get(
    "/workflowitem.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Retrieve all workflowitems of a given subproject. Those items the " +
          "user is not allowed to see will be redacted, that is, most of their values will be " +
          "set to null.",
        tags: ["workflowitem"],
        summary: "List all workflowitems of a given subproject",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
            subprojectId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  workflowitems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            creationUnixTs: { type: "string" },
                            status: { type: "string" },
                            displayName: { type: "string" },
                            description: { type: "string" },
                            amount: { type: "string" },
                            assignee: { type: "string" },
                            currency: { type: "string" },
                            documents: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "string" },
                                  hash: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                        allowedIntents: { type: "array", items: { type: "string" } },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getWorkflowitemList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/workflowitem.assign",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Assign a workflowitem to a given user. The assigned user will be notified about the change.",
        tags: ["workflowitem"],
        summary: "Assign a user or group to a workflowitem",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                workflowitemId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      assignWorkflowitem(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/workflowitem.update",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Partially update a workflowitem. Only properties mentioned in the request body are touched, " +
          "others are not affected. The assigned user will be notified about the change.",
        tags: ["workflowitem"],
        summary: "Update a workflowitem",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                displayName: { type: "string" },
                description: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                workflowitemId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      updateWorkflowitem(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/workflowitem.close",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Set a workflowitem's status to 'closed'.",
        tags: ["workflowitem"],
        summary: "Close a workflowitem",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                workflowitemId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      closeWorkflowitem(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/workflowitem.intent.listPermissions",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the permissions for a given workflowitem.",
        tags: ["workflowitem"],
        summary: "List all permissions",
        params: {
          type: "object",
          properties: {
            projectId: {
              type: "string",
            },
            subprojectId: {
              type: "string",
            },
            workflowitemId: {
              type: "string",
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getWorkflowitemPermissions(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/workflowitem.intent.grantPermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant a permission to a user. After this call has returned, the " +
          "user will be allowed to execute the given intent.",
        tags: ["workflowitem"],
        summary: "Grant a permission to a user or group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                workflowitemId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      grantWorkflowitemPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/workflowitem.intent.revokePermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke a permission from a user. After this call has returned, the " +
          "user will no longer be able to execute the given intent.",
        tags: ["workflowitem"],
        summary: "Revoke a permission from a user or group",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                identity: { type: "string" },
                intent: { type: "string" },
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                workflowitemId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      revokeWorkflowitemPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/workflowitem.validateDocument",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Validates if the hashed base64 string equals the hash sent by the user.",
        tags: ["workflowitem"],
        summary: "Validate a document",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                base64String: { type: "string" },
                hash: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  isIdentical: { type: "boolean" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      validateDocument(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       notification
  // ------------------------------------------------------------

  server.get(
    "/notification.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "List notifications for the user, given by the token in the " +
          "request's `Authorization` header. By default, the response includes _all_ notifications, " +
          "but the `sinceId` parameter may be used to truncate the output.",
        tags: ["notification"],
        summary: "List all notification of the authorized user",
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  notifications: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        notificationId: { type: "string" },
                        resources: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              type: { type: "string" },
                            },
                          },
                        },
                        isRead: { type: "boolean" },
                        originalEvent: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string" },
                            createdBy: { type: "string" },
                            isRcreatedAtead: { type: "string" },
                            dataVersion: { type: "string" },
                            data: {
                              type: "object",
                              additionalProperties: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getNotificationList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/notification.markRead",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Allows a user to mark any of his/her notifications as read, which " +
          "is then reflected by the `isRead` flag carried in the `notification.list` response.",
        tags: ["notification"],
        summary: "Mark all notification as read",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                notificationId: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      markNotificationRead(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       network
  // ------------------------------------------------------------

  server.post(
    "/network.registerNode",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Used by non-master MultiChain nodes to register their wallet address.",
        tags: ["network"],
        summary: "Register a node",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                address: { type: "string" },
                organization: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      registerNode(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/network.voteForPermission",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Votes for granting/revoking network-level permissions to/from a " +
          "registered node (identified by its wallet addresses). After this call, the voted " +
          "access level may or may not be in effect, depending on the consensus parameters of " +
          "the underlying blockchain.",
        tags: ["network"],
        summary: "Vote for permission",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                address: { type: "string" },
                vote: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      voteForNetworkPermission(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/network.approveNewOrganization",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "coming soon",
        tags: ["network"],
        summary: "Approve a new organization",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                organization: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      approveNewOrganization(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    "/network.approveNewNodeForExistingOrganization",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "coming soon",
        tags: ["network"],
        summary: "Approve a new node",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string" },
            data: {
              type: "object",
              properties: {
                address: { type: "string" },
              },
            },
          },
        },
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "string",
              },
            },
          },
          401: getAuthErrorSchema(),
          409: {
            description:
              "Tells either your organization has already voted or the permissions are already assigned",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                },
              },
            },
          },
        },
      },
    } as Schema,
    async (request, reply) => {
      approveNewNodeForExistingOrganization(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/network.list",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "List all nodes.",
        tags: ["network"],
        summary: "List all nodes",
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  nodes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        address: {
                          type: "object",
                          properties: {
                            address: { type: "string" },
                            organization: { type: "string" },
                          },
                        },
                        myVote: { type: "string" },
                        currentAccess: {
                          type: "object",
                          properties: {
                            accessType: { type: "string" },
                            approvers: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  address: { type: "string" },
                                  organization: { type: "string" },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getNodeList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    "/network.listActive",
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Get the number of all peers in the blockchain network.",
        tags: ["network"],
        summary: "List all active peers",
        response: {
          200: {
            description: "Succesful response",
            type: "object",
            properties: {
              apiVersion: { type: "string" },
              data: {
                type: "object",
                properties: {
                  peers: { type: "string" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
        },
      },
    } as Schema,
    async (request, reply) => {
      getActiveNodes(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  return server;
};
