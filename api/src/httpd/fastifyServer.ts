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

const URL_PREFIX = "/api";

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

    case "ProjectIdAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The project's id already exists.` },
        },
      ]);
      break;

    case "SubprojectIdAlreadyExists":
      send(res, [
        409,
        {
          apiVersion: "1.0",
          error: { code: 409, message: `The subproject's id already exists.` },
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
      apiVersion: { type: "string", example: "1.0" },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "401" },
          message: {
            type: "string",
            example: "A valid JWT auth bearer token is required for this route.",
          },
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
    `${URL_PREFIX}/readiness`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Returns '200 OK' if the API is up and the Multichain service is reachable. " +
          "'503 Service unavailable.' otherwise.",
        tags: ["system"],
        summary: "Check if the Multichain is reachable",
        security: [
          {
            bearerToken: [],
          },
        ],
        response: {
          200: {
            description: "successful response",
            type: "string",
            example: "OK",
          },
          401: getAuthErrorSchema(),
          503: {
            description: "Blockchain not ready",
            type: "string",
            example: "Service unavailable.",
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
    `${URL_PREFIX}/liveness`,
    {
      schema: {
        description: "Returns '200 OK' if the API is up.",
        tags: ["system"],
        summary: "Check if the API is up",
        response: {
          200: {
            description: "Successful response",
            type: "string",
            example: "OK",
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
    `${URL_PREFIX}/user.authenticate`,
    {
      schema: {
        description:
          "Authenticate and retrieve a token in return. This token can then be supplied in the " +
          "HTTP Authorization header, which is expected by most of the other. " +
          "\nIf a token is required write 'Bearer' into the 'API Token' field of an endpoint " +
          "you want to test and copy the token afterwards like in the following example:\n " +
          ".\n" +
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        tags: ["user"],
        summary: "Authenticate with user and password",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    password: { type: "string", example: "mypassword" },
                  },
                  required: ["id", "password"],
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
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "myId" },
                      displayName: { type: "string", example: "myDisplayName" },
                      organization: { type: "string", example: "myorganization" },
                      allowedIntents: { type: "array", items: { type: "string" } },
                      token: {
                        type: "string",
                        example:
                          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJyb290IiwiYWRkcm" +
                          "VzcyI6IjFIVXF2dHE5WU1QaXlMZUxWM3pGRks5dGpBblVDVTNFbTQzaVBrIiwib3JnYW" +
                          "5pemF0aW9uIjoiS2ZXIiwib3JnYW5pemF0aW9uQWRkcmVzcyI6IjFIVXF2dHE5WU1QaXl" +
                          "MZUxWM3pGRks5dGpBblVDVTNFbTQzaVBrIiwiZ3JvdXBzIjpbXSwiaWF0IjoxNTM2ODI2M" +
                          "TkyLCJleHAiOjE1MzY4Mjk3OTJ9.PZbjTpsgnIHjNaDHos9LVwwrckYhpWjv1DDiojskylI",
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
    `${URL_PREFIX}/user.list`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "List all registered users.",
        tags: ["user"],
        summary: "List all registered users",
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
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "myId" },
                        displayName: { type: "string", example: "myDisplayName" },
                        organization: { type: "string", example: "myorganization" },
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
      console.log(request);
      getUserList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  // ------------------------------------------------------------
  //       global
  // ------------------------------------------------------------
  server.post(
    `${URL_PREFIX}/global.createUser`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a new user.",
        tags: ["global"],
        summary: "Create a user",
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
              properties: {
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    displayName: { type: "string", example: "myDisplayName" },
                    organization: { type: "string", example: "myorganization" },
                    password: { type: "string", example: "mypassword" },
                  },
                  required: ["id", "displayName", "organization", "password"],
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
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "myId" },
                      displayName: { type: "string", example: "myDisplayName" },
                      organization: { type: "string", example: "myorganization" },
                      address: {
                        type: "string",
                        example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                      },
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
              apiVersion: { type: "string", example: "1.0" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string", example: "409" },
                  message: { type: "string", example: "User already exists." },
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
    `${URL_PREFIX}/global.createGroup`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Create a new group.",
        tags: ["global"],
        summary: "Create a new group",
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
              properties: {
                group: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    displayName: { type: "string", example: "myDisplayName" },
                    users: { type: "array", items: { type: "string" } },
                  },
                  required: ["id", "displayName", "users"],
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
                  created: { type: "boolean", example: "true" },
                },
              },
            },
          },
          401: getAuthErrorSchema(),
          409: {
            description: "Group already exists",
            type: "object",
            properties: {
              apiVersion: { type: "string", example: "1.0" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string", example: "409" },
                  message: { type: "string", example: "User already exists." },
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
    `${URL_PREFIX}/global.createProject`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
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
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                project: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    status: { type: "string", example: "open" },
                    displayName: { type: "string", example: "myDisplayName" },
                    description: { type: "string", example: "myDescription" },
                    amount: { type: "string", example: "500" },
                    assignee: { type: "string", example: "assigneeName" },
                    currency: { type: "string", example: "EUR" },
                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
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
                  created: { type: "boolean", example: "true" },
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
    `${URL_PREFIX}/global.listPermissions`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the current global permissions.",
        tags: ["global"],
        summary: "List all existing permissions",
        querystring: {
          type: "object",
          properties: {
            projectId: {
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
                example: { "notification.list": ["szd"], "notification.markRead": ["szd"] },
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
    `${URL_PREFIX}/global.grant permission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant the right to execute a specific intent on the Global scope to a given user.",
        tags: ["global"],
        summary: "Grant a permission to a group or user",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
              },
              required: ["identity", "intent"],
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
    `${URL_PREFIX}/global.grantAllPermissions`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant all available permissions to a user. Useful as a shorthand for creating admin users.",
        tags: ["global"],
        summary: "Grant all permission to a group or user",
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
              properties: {
                identity: { type: "string", example: "alice" },
              },
              required: ["identity"],
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
                type: "string",
                example: "OK",
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
    `${URL_PREFIX}/global.revokePermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke the right to execute a specific intent on the Global scope to a given user.",
        tags: ["global"],
        summary: "Revoke a permission from a group or user",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
              },
              required: ["identity", "intent"],
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
    `${URL_PREFIX}/group.list`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "List all user groups.",
        tags: ["group"],
        summary: "List all existing groups",
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
                  groups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        groupId: { type: "string", example: "myGroupId" },
                        displayName: { type: "string", example: "myDisplayName" },
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
    `${URL_PREFIX}/group.addUser`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Add user to a group",
        tags: ["group"],
        summary: "Add a user to a group",
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
              properties: {
                groupId: { type: "string", example: "myGroupId" },
                userId: { type: "string", example: "myUserId" },
              },
              required: ["groupId", "userId"],
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
                  added: { type: "boolean", example: "true" },
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
    `${URL_PREFIX}/group.removeUser`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Remove user from a group",
        tags: ["group"],
        summary: "Remove a user from a group",
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
              properties: {
                groupId: { type: "string", example: "myGroupId" },
                userId: { type: "string", example: "myUserId" },
              },
              required: ["groupId", "userId"],
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
                  deleted: { type: "boolean", example: "true" },
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
    `${URL_PREFIX}/project.list`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Retrieve all projects the user is allowed to see.",
        tags: ["project"],
        summary: "List all projects",
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
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "myId" },
                            creationUnixTs: { type: "string", example: "1536154645775" },
                            status: { type: "string", example: "open" },
                            displayName: { type: "string", example: "myDisplayName" },
                            description: { type: "string", example: "myDescription" },
                            amount: { type: "string", example: "500" },
                            assignee: { type: "string", example: "assigneeName" },
                            currency: { type: "string", example: "EUR" },
                            thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                          },
                        },
                        log: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              key: { type: "string" },
                              intent: { type: "string", example: "global.createProject" },
                              createdBy: { type: "string", example: "alice" },
                              createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                              dataVersion: { type: "string", example: "1" },
                              data: {
                                type: "object",
                                properties: {
                                  project: {
                                    type: "object",
                                    properties: {
                                      id: { type: "string", example: "myId" },
                                      creationUnixTs: { type: "string", example: "1536154645775" },
                                      status: { type: "string", example: "open" },
                                      displayName: { type: "string", example: "myDisplayName" },
                                      description: { type: "string", example: "myDescription" },
                                      amount: { type: "string", example: "500" },
                                      assignee: { type: "string", example: "assigneeName" },
                                      currency: { type: "string", example: "EUR" },
                                      thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                    },
                                  },
                                  permissions: {
                                    type: "object",
                                    additionalProperties: true,
                                    example: {
                                      "subproject.intent.listPermissions": ["alice", "john"],
                                    },
                                  },
                                  snapshot: {
                                    type: "object",
                                    properties: {
                                      displayName: { type: "string", example: "myDisplayName" },
                                    },
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
    `${URL_PREFIX}/project.viewDetails`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Retrieve details about a specific project.",
        tags: ["project"],
        summary: "View details",
        querystring: {
          type: "object",
          properties: {
            projectId: {
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
                properties: {
                  project: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "myId" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "myDisplayName" },
                          description: { type: "string", example: "myDescription" },
                          amount: { type: "string", example: "500" },
                          assignee: { type: "string", example: "assigneeName" },
                          currency: { type: "string", example: "EUR" },
                          thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string", example: "global.createProject" },
                            createdBy: { type: "string", example: "alice" },
                            createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              properties: {
                                project: {
                                  type: "object",
                                  properties: {
                                    id: { type: "string", example: "myId" },
                                    creationUnixTs: { type: "string", example: "1536154645775" },
                                    status: { type: "string", example: "open" },
                                    displayName: { type: "string", example: "myDisplayName" },
                                    description: { type: "string", example: "myDescription" },
                                    amount: { type: "string", example: "500" },
                                    assignee: { type: "string", example: "assigneeName" },
                                    currency: { type: "string", example: "EUR" },
                                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                  },
                                },
                                permissions: {
                                  type: "object",
                                  additionalProperties: true,
                                  example: {
                                    "subproject.intent.listPermissions": ["alice", "john"],
                                  },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: { type: "string", example: "myDisplayName" },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                  subprojects: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: true,
                      example: { mySubproject: {} },
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
    `${URL_PREFIX}/project.assign`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Assign a project to a given user. The assigned user will be notified about the change.",
        tags: ["project"],
        summary: "Assign a user or group to a project",
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
              properties: {
                identity: { type: "string", example: "alice" },
                projectId: { type: "string", example: "projectId" },
              },
              required: ["identity", "projectId"],
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
    `${URL_PREFIX}/project.update`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Partially update a project. Only properties mentioned in the request body are touched, " +
          "others are not affected. The assigned user will be notified about the change.",
        tags: ["project"],
        summary: "Update a project",
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
              properties: {
                displayName: { type: "string", example: "myDisplayName" },
                description: { type: "string", example: "myDescription" },
                amount: { type: "string", example: "500" },
                assignee: { type: "string", example: "assigneeName" },
                currency: { type: "string", example: "EUR" },
                projectId: { type: "string", example: "projectId" },
              },
              required: ["projectId"],
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
    `${URL_PREFIX}/project.close`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Set a project's status to 'closed' if, and only if, all associated " +
          "subprojects are already set to 'closed'.",
        tags: ["project"],
        summary: "Close a project",
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
              properties: {
                projectId: { type: "string", example: "projectId" },
              },
              required: ["projectId"],
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
    `${URL_PREFIX}/project.createSubproject`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Create a subproject and associate it to the given project.\n.\n" +
          "Note that the only possible values for 'status' are: 'open' and 'closed'",
        tags: ["project"],
        summary: "Create a subproject",
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
              properties: {
                projectId: { type: "string", example: "projectId" },
                subproject: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    status: { type: "string", example: "open" },
                    displayName: { type: "string", example: "myDisplayName" },
                    description: { type: "string", example: "myDescription" },
                    amount: { type: "string", example: "500" },
                    assignee: { type: "string", example: "assigneeName" },
                    currency: { type: "string", example: "EUR" },
                  },
                  required: ["displayName", "description", "amount", "assignee", "currency"],
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
                  created: { type: "boolean", example: "true" },
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
    `${URL_PREFIX}/project.viewHistory`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "View the history of a given project (filtered by what the user is allowed to see).",
        tags: ["project"],
        summary: "View history",
        querystring: {
          type: "object",
          properties: {
            projectId: {
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
                properties: {
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        intent: { type: "string", example: "global.createProject" },
                        createdBy: { type: "string", example: "alice" },
                        createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                        dataVersion: { type: "string", example: "1" },
                        data: {
                          type: "object",
                          additionalProperties: true,
                          properties: {
                            permissions: {
                              type: "object",
                              additionalProperties: true,
                              example: { "subproject.intent.listPermissions": ["alice", "john"] },
                            },
                            snapshot: {
                              type: "object",
                              properties: {
                                displayName: { type: "string", example: "myDisplayName" },
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
      getProjectHistory(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${URL_PREFIX}/project.intent.listPermissions`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the permissions for a given project.",
        tags: ["project"],
        summary: "List all permissions",
        querystring: {
          type: "object",
          properties: {
            projectId: {
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
                example: {
                  "project.viewDetails": ["alice", "john"],
                },
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
    `${URL_PREFIX}/project.intent.grantPermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant a permission to a user. After this call has returned, the " +
          "user will be allowed to execute the given intent.",
        tags: ["project"],
        summary: "Grant a permission to a user or group",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
                projectId: { type: "string", example: "projectId" },
              },
              required: ["identity", "intent", "projectId"],
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
    `${URL_PREFIX}/project.intent.revokePermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke a permission from a user. After this call has returned, the " +
          "user will no longer be able to execute the given intent.",
        tags: ["project"],
        summary: "Revoke a permission from a user or group",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
                projectId: { type: "string", example: "projectId" },
              },
              required: ["identity", "intent", "projectId"],
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
    `${URL_PREFIX}/subproject.list`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Retrieve all subprojects for a given project. Note that any " +
          "subprojects the user is not allowed to see are left out of the response.",
        tags: ["subproject"],
        summary: "List all subprojects of a given project",
        querystring: {
          type: "object",
          properties: {
            projectId: {
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
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "myId" },
                            creationUnixTs: { type: "string", example: "1536154645775" },
                            status: { type: "string", example: "open" },
                            displayName: { type: "string", example: "myDisplayName" },
                            description: { type: "string", example: "myDescription" },
                            amount: { type: "string", example: "500" },
                            assignee: { type: "string", example: "assigneeName" },
                            currency: { type: "string", example: "EUR" },
                            thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                          },
                        },
                        log: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              key: { type: "string" },
                              intent: { type: "string", example: "global.createProject" },
                              createdBy: { type: "string", example: "alice" },
                              createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                              dataVersion: { type: "string", example: "1" },
                              data: {
                                type: "object",
                                properties: {
                                  subproject: {
                                    type: "object",
                                    properties: {
                                      id: { type: "string", example: "myId" },
                                      creationUnixTs: { type: "string", example: "1536154645775" },
                                      status: { type: "string", example: "open" },
                                      displayName: { type: "string", example: "myDisplayName" },
                                      description: { type: "string", example: "myDescription" },
                                      amount: { type: "string", example: "500" },
                                      assignee: { type: "string", example: "assigneeName" },
                                      currency: { type: "string", example: "EUR" },
                                      thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                    },
                                  },
                                  permissions: {
                                    type: "object",
                                    additionalProperties: true,
                                    example: {
                                      "subproject.intent.listPermissions": ["alice", "john"],
                                    },
                                  },
                                  snapshot: {
                                    type: "object",
                                    properties: {
                                      displayName: { type: "string", example: "myDisplayName" },
                                    },
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
    `${URL_PREFIX}/subproject.viewDetails`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Retrieve details about a specific subproject.",
        tags: ["subproject"],
        summary: "View details",
        querystring: {
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
                  parentProject: {
                    type: "object",
                    id: { type: "string", example: "parentId" },
                    displayName: { type: "string", example: "parentDisplayName" },
                  },
                  subproject: {
                    type: "object",
                    properties: {
                      data: {
                        type: "object",
                        properties: {
                          id: { type: "string", example: "myId" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "myDisplayName" },
                          description: { type: "string", example: "myDescription" },
                          amount: { type: "string", example: "500" },
                          assignee: { type: "string", example: "assigneeName" },
                          currency: { type: "string", example: "EUR" },
                          thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string", example: "global.createProject" },
                            createdBy: { type: "string", example: "alice" },
                            createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              properties: {
                                subproject: {
                                  type: "object",
                                  properties: {
                                    id: { type: "string", example: "myId" },
                                    creationUnixTs: { type: "string", example: "1536154645775" },
                                    status: { type: "string", example: "open" },
                                    displayName: { type: "string", example: "myDisplayName" },
                                    description: { type: "string", example: "myDescription" },
                                    amount: { type: "string", example: "500" },
                                    assignee: { type: "string", example: "assigneeName" },
                                    currency: { type: "string", example: "EUR" },
                                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                  },
                                },
                                permissions: {
                                  type: "object",
                                  additionalProperties: true,
                                  example: {
                                    "subproject.intent.listPermissions": ["alice", "john"],
                                  },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: { type: "string", example: "myDisplayName" },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      allowedIntents: { type: "array", items: { type: "string" } },
                    },
                  },
                  workflowitems: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: true,
                      example: { myWorkflowItems: {} },
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
    `${URL_PREFIX}/subproject.assign`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Assign a subproject to a given user. The assigned user will be notified about the change.",
        tags: ["subproject"],
        summary: "Assign a user or group to a subproject",
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
              properties: {
                identity: { type: "string", example: "alice" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
              },
              required: ["identity", "subprojectId", "projectId"],
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
    `${URL_PREFIX}/subproject.update`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Partially update a subproject. Only properties mentioned in the request body are touched, " +
          "others are not affected. The assigned user will be notified about the change.",
        tags: ["subproject"],
        summary: "Update a subproject",
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
              properties: {
                displayName: { type: "string", example: "myDisplayName" },
                description: { type: "string", example: "myDescription" },
                amount: { type: "string", example: "500" },
                assignee: { type: "string", example: "assigneeName" },
                currency: { type: "string", example: "EUR" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
              },
              required: ["subprojectId", "projectId"],
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
    `${URL_PREFIX}/subproject.close`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Set a subproject's status to 'closed' if, and only if, all " +
          "associated workflowitems are already set to 'closed'.",
        tags: ["subproject"],
        summary: "Close a subproject",
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
              properties: {
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
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
    `${URL_PREFIX}/subproject.reorderWorkflowitems`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Set a new workflowitem ordering. Workflowitems not included in the list " +
          "will be ordered by their creation time and placed after all explicitly ordered workflowitems.",
        tags: ["subproject"],
        summary: "Reorder the workflowitems of the given subproject",
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
              properties: {
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
                ordering: {
                  type: "array",
                  items: {
                    type: "string",
                    example: "56z9ki1ca780434a58b0752f3470301",
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
    `${URL_PREFIX}/subproject.createWorkflowitem`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Create a workflowitem and associate it to the given subproject.\n.\n" +
          "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
          "The only possible values for 'status' are: 'open' and 'closed'",
        tags: ["subproject"],
        summary: "Create a workflowitem",
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
              properties: {
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "subprojectId" },

                status: { type: "string", example: "open" },
                displayName: { type: "string", example: "myDisplayName" },
                description: { type: "string", example: "myDescription" },
                amount: { type: "string", example: "500" },
                assignee: { type: "string", example: "assigneeName" },
                currency: { type: "string", example: "EUR" },
                amountType: { type: "string", example: "disbursed" },
                documents: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "myId" },
                      base64: { type: "string", example: "dGVzdCBiYXNlNjRTdHJpbmc=" },
                    },
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
                  created: { type: "boolean", example: "true" },
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
    `${URL_PREFIX}/subproject.viewHistory`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "View the history of a given subproject (filtered by what the user is allowed to see).",
        tags: ["subproject"],
        summary: "View history",
        querystring: {
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
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        key: { type: "string" },
                        intent: { type: "string", example: "global.createProject" },
                        createdBy: { type: "string", example: "alice" },
                        createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                        dataVersion: { type: "string", example: "1" },
                        data: {
                          type: "object",
                          additionalProperties: true,
                          example: {
                            subproject: {
                              id: "mysubId45",
                              creationUnixTs: "1536834568552",
                              status: "open",
                              displayName: "myDisplayName",
                              description: "myDescription",
                              amount: "500",
                              currency: "EUR",
                              assignee: "assigneeName",
                            },
                          },
                          properties: {
                            permissions: {
                              type: "object",
                              additionalProperties: true,
                              example: { "subproject.intent.listPermissions": ["alice", "john"] },
                            },
                            snapshot: {
                              type: "object",
                              properties: {
                                displayName: { type: "string", example: "myDisplayName" },
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
      getSubprojectHistory(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.get(
    `${URL_PREFIX}/subproject.intent.listPermissions`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the permissions for a given subproject.",
        tags: ["subproject"],
        summary: "List all permissions",
        querystring: {
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
                example: {
                  "project.viewDetails": ["alice", "john"],
                },
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
    `${URL_PREFIX}/subproject.intent.grantPermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant a permission to a user. After this call has returned, the " +
          "user will be allowed to execute the given intent.",
        tags: ["subproject"],
        summary: "Grant a permission to a user or group",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
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
    `${URL_PREFIX}/subproject.intent.revokePermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
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
    `${URL_PREFIX}/workflowitem.list`,
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
        querystring: {
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
                  workflowitems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        data: {
                          type: "object",
                          properties: {
                            id: { type: "string", example: "myId" },
                            creationUnixTs: { type: "string", example: "1536154645775" },
                            status: { type: "string", example: "open" },
                            amountType: { type: "string", example: "disbursed" },
                            displayName: { type: "string", example: "myDisplayName" },
                            description: { type: "string", example: "myDescription" },
                            amount: { type: "string", example: "500" },
                            assignee: { type: "string", example: "assigneeName" },
                            currency: { type: "string", example: "EUR" },
                            documents: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  id: { type: "string", example: "myId" },
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
    `${URL_PREFIX}/workflowitem.assign`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Assign a workflowitem to a given user. The assigned user will be notified about the change.",
        tags: ["workflowitem"],
        summary: "Assign a user or group to a workflowitem",
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
              properties: {
                identity: { type: "string", example: "alice" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
                workflowitemId: { type: "string", example: "workflowitemId" },
              },
              required: ["identity", "workflowitemId", "subprojectId", "projectId"],
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
    `${URL_PREFIX}/workflowitem.update`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Partially update a workflowitem. Only properties mentioned in the request body are touched, " +
          "others are not affected. The assigned user will be notified about the change.\n" +
          "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
          "The only possible values for 'status' are: 'open' and 'closed'",
        tags: ["workflowitem"],
        summary: "Update a workflowitem",
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
              properties: {
                displayName: { type: "string", example: "myDisplayName" },
                description: { type: "string", example: "myDescription" },
                amountType: { type: "string", example: "disbursed" },
                amount: { type: "string", example: "500" },
                assignee: { type: "string", example: "assigneeName" },
                currency: { type: "string", example: "EUR" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
                workflowitemId: { type: "string", example: "workflowitemId" },
              },
              required: ["workflowitemId", "subprojectId", "projectId"],
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
    `${URL_PREFIX}/workflowitem.close`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Set a workflowitem's status to 'closed'.",
        tags: ["workflowitem"],
        summary: "Close a workflowitem",
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
              properties: {
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
                workflowitemId: { type: "string", example: "workflowitemId" },
              },
              required: ["workflowitemId", "subprojectId", "projectId"],
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
    `${URL_PREFIX}/workflowitem.intent.listPermissions`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "See the permissions for a given workflowitem.",
        tags: ["workflowitem"],
        summary: "List all permissions",
        querystring: {
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
                example: {
                  "project.viewDetails": ["alice", "john"],
                },
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
    `${URL_PREFIX}/workflowitem.intent.grantPermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Grant a permission to a user. After this call has returned, the " +
          "user will be allowed to execute the given intent.",
        tags: ["workflowitem"],
        summary: "Grant a permission to a user or group",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
                workflowitemId: { type: "string", example: "workflowitemId" },
              },
              required: ["identity", "intent", "workflowitemId", "subprojectId", "projectId"],
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
    `${URL_PREFIX}/workflowitem.intent.revokePermission`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Revoke a permission from a user. After this call has returned, the " +
          "user will no longer be able to execute the given intent.",
        tags: ["workflowitem"],
        summary: "Revoke a permission from a user or group",
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
              properties: {
                identity: { type: "string", example: "alice" },
                intent: { type: "string", example: "global.createProject" },
                projectId: { type: "string", example: "projectId" },
                subprojectId: { type: "string", example: "projectId" },
                workflowitemId: { type: "string", example: "workflowitemId" },
              },
              required: ["identity", "intent", "workflowitemId", "subprojectId", "projectId"],
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
    `${URL_PREFIX}/workflowitem.validateDocument`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Validates if the hashed base64 string equals the hash sent by the user.",
        tags: ["workflowitem"],
        summary: "Validate a document",
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
              properties: {
                base64String: { type: "string" },
                hash: { type: "string" },
              },
              required: ["base64String", "hash"],
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
    `${URL_PREFIX}/notification.list`,
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
                              id: { type: "string", example: "myId" },
                              type: { type: "string" },
                            },
                          },
                        },
                        isRead: { type: "boolean" },
                        originalEvent: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string", example: "global.createProject" },
                            createdBy: { type: "string", example: "alice" },
                            isRcreatedAtead: { type: "string" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              additionalProperties: true,
                              example: {
                                project: {
                                  id: "myId45",
                                  creationUnixTs: "1536834480274",
                                  status: "open",
                                  displayName: "myDisplayName",
                                  description: "myDescription",
                                  amount: "500",
                                  assignee: "Stefan",
                                  currency: "EUR",
                                  thumbnail: "/Thumbnail_0001.jpg",
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
      getNotificationList(multichainClient, request)
        .then(response => send(reply, response))
        .catch(err => handleError(request, reply, err));
    },
  );

  server.post(
    `${URL_PREFIX}/notification.markRead`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Allows a user to mark any of his/her notifications as read, which " +
          "is then reflected by the `isRead` flag carried in the `notification.list` response.",
        tags: ["notification"],
        summary: "Mark all notification as read",
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
              properties: {
                notificationId: { type: "string" },
              },
              required: ["notificationId"],
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
    `${URL_PREFIX}/network.registerNode`,
    {
      schema: {
        description: "Used by non-master MultiChain nodes to register their wallet address.",
        tags: ["network"],
        summary: "Register a node",
        body: {
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
                organization: { type: "string", example: "myorganization" },
              },
              required: ["address", "organization"],
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
    `${URL_PREFIX}/network.voteForPermission`,
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
              properties: {
                address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
                vote: { type: "string", example: "admin" },
              },
              required: ["address", "vote"],
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
    `${URL_PREFIX}/network.approveNewOrganization`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Approves a new organization if there are enough votes.",
        tags: ["network"],
        summary: "Approve a new organization",
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
              properties: {
                organization: { type: "string", example: "myorganization" },
              },
              required: ["organization"],
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
    `${URL_PREFIX}/network.approveNewNodeForExistingOrganization`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description:
          "Approves a new node for an existing organization." +
          " This organization doesn't have to go throught the voting system again",
        tags: ["network"],
        summary: "Approve a new node",
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
              properties: {
                address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
              },
              required: ["address"],
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
              apiVersion: { type: "string", example: "1.0" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string", example: "409" },
                  message: { type: "string", example: "User already exists." },
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
    `${URL_PREFIX}/network.list`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "List all nodes.",
        tags: ["network"],
        summary: "List all nodes",
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
                  nodes: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        address: {
                          type: "object",
                          properties: {
                            address: {
                              type: "string",
                              example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                            },
                            organization: { type: "string", example: "myorganization" },
                          },
                        },
                        myVote: { type: "string", example: "admin" },
                        currentAccess: {
                          type: "object",
                          properties: {
                            accessType: { type: "string", example: "admin" },
                            approvers: {
                              type: "array",
                              items: {
                                type: "object",
                                properties: {
                                  address: {
                                    type: "string",
                                    example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                                  },
                                  organization: { type: "string", example: "myorganization" },
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
    `${URL_PREFIX}/network.listActive`,
    {
      // @ts-ignore: Unreachable code error
      beforeHandler: [server.authenticate],
      schema: {
        description: "Get the number of all peers in the blockchain network.",
        tags: ["network"],
        summary: "List all active peers",
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
                  peers: { type: "string", example: "56" },
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
