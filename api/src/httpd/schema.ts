import { FastifySchema } from "fastify";
import { projectIntents } from "../authz/intents";

export interface SwaggerSchema extends FastifySchema {
  description: string;
  tags: string[];
  summary: string;
  security?: object;
  consumes?: string[];
}

export interface Schema {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preValidation?: any;
  schema: SwaggerSchema;
}

interface Schemas {
  [key: string]: Schema;
}

// ------------------------------------------------------------
//       Responses
// ------------------------------------------------------------

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

function getSuccessfulSchema() {
  return {
    description: "successful response",
    type: "object",
  };
}

const schemas: Schemas = {
  // ------------------------------------------------------------
  //       system
  // ------------------------------------------------------------
  readiness: {
    schema: {
      description:
        "Returns '200 Ready' if the API is up and the Multichain service is reachable. " +
        "'504 Gateway Timeout.' otherwise.",
      tags: ["system"],
      summary: "Check if the Multichain is reachable",
      response: {
        200: getSuccessfulSchema(),
        401: getAuthErrorSchema(),
        504: {
          description: "Blockchain not ready",
          type: "string",
          example: "Not ready. Waiting for multichain.",
        },
      },
    },
  },

  liveness: {
    schema: {
      description: "Returns '200' and uptime in seconds if the API is up.",
      tags: ["system"],
      summary: "Check if the API is up",
      response: {
        200: getSuccessfulSchema(),
      },
    },
  },

  version: {
    schema: {
      description: "Returns version of the current release.",
      tags: ["system"],
      summary: "Check version of current release.",
      response: {
        200: {
          description: "successful response",
          type: "object",
          properties: {
            apiVersion: { type: "string", example: "1.0" },
            data: {
              type: "object",
              properties: {
                api: {
                  type: "object",
                  properties: {
                    release: { type: "string", example: "1.0.0" },
                    commit: { type: "string", example: "f48b2af8e44f6a6d46f512efc68de35cb7e44c00" },
                    buildTimeStamp: { type: "string", example: "1546950454" },
                  },
                },
                blockchain: {
                  type: "object",
                  properties: {
                    release: { type: "string", example: "1.0.0" },
                    commit: { type: "string", example: "f48b2af8e44f6a6d46f512efc68de35cb7e44c00" },
                    buildTimeStamp: { type: "string", example: "1546950454" },
                    ping: { type: "number", example: "32.476300001144409" },
                  },
                },
                multichain: {
                  type: "object",
                  properties: {
                    release: { type: "string", example: "1.0.0" },
                    ping: { type: "number", example: "32.476300001144409" },
                  },
                },
                storage: {
                  type: "object",
                  properties: {
                    release: { type: "string", example: "1.0.0" },
                    commit: { type: "string", example: "f48b2af8e44f6a6d46f512efc68de35cb7e44c00" },
                    buildTimeStamp: { type: "string", example: "1546950454" },
                    ping: { type: "number", example: "32.476300001144409" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  // ------------------------------------------------------------
  //       user
  // ------------------------------------------------------------
  authenticate: {
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
            additionalProperties: false,
            properties: {
              user: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", example: "aSmith" },
                  password: { type: "string", example: "mySecretPassword" },
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
                    id: { type: "string", example: "aSmith" },
                    displayName: { type: "string", example: "Alice Smith" },
                    organization: { type: "string", example: "Alice's Solutions & Co" },
                    allowedIntents: { type: "array", items: { type: "string" } },
                    groups: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          groupId: { type: "string", example: "Manager" },
                          displayName: { type: "string", example: "All Manager Group" },
                        },
                      },
                    },
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
  },

  userList: {
    schema: {
      description:
        "List all registered users and groups.\n" +
        "In case of a user the 'organization' property exists" +
        "In case of a group the 'isGroup' property exists with value 'true",
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
                      id: { type: "string", example: "aSmith" },
                      displayName: { type: "string", example: "Alice Smith" },
                      organization: { type: "string", example: "Alice's Solutions & Co" },
                      isGroup: { type: "boolean", example: true },
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
  },

  // ------------------------------------------------------------
  //       global
  // ------------------------------------------------------------
  createUser: {
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
            additionalProperties: false,
            properties: {
              user: {
                type: "object",
                properties: {
                  additionalProperties: false,
                  id: { type: "string", example: "aSmith" },
                  displayName: { type: "string", example: "Alice Smith" },
                  organization: { type: "string", example: "Alice's Solutions & Co" },
                  password: { type: "string", example: "mySecretPassword" },
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
                    displayName: { type: "string", example: "Alice Smith" },
                    organization: { type: "string", example: "Alice's Solutions & Co" },
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
  },

  createGroup: {
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
        required: ["apiVersion", "data"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["group"],
            properties: {
              group: {
                type: "object",
                required: ["id", "displayName", "users"],
                properties: {
                  additionalProperties: false,
                  id: { type: "string", example: "Manager" },
                  displayName: { type: "string", example: "All Manager Group" },
                  users: { type: "array", items: { type: "string" } },
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
  },

  createProject: {
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
                additionalProperties: false,
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  status: { type: "string", example: "open" },
                  displayName: { type: "string", example: "Build a town-project" },
                  description: { type: "string", example: "A town should be built" },
                  assignee: { type: "string", example: "aSmith" },
                  projectedBudgets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        organization: { type: "string", example: "MyOrga" },
                        value: { type: "string", example: "1234" },
                        currencyCode: { type: "string", example: "EUR" },
                      },
                    },
                  },
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
  },

  globalListPermissions: {
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
              example: { "notification.list": ["aSmith"], "notification.markRead": ["aSmith"] },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  globalGrantPermission: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
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
  },

  globalGrantAllPermissions: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
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
  },

  globalRevokePermission: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
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
  },
  // ------------------------------------------------------------
  //       group
  // ------------------------------------------------------------
  groupList: {
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
                      groupId: { type: "string", example: "Manager" },
                      displayName: { type: "string", example: "All Manager Group" },
                      users: {
                        type: "array",
                        items: { type: "string", example: "aSmith" },
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
  },

  addUser: {
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
            additionalProperties: false,
            properties: {
              groupId: { type: "string", example: "Manager" },
              userId: { type: "string", example: "aSmith" },
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
  },

  removeUser: {
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
            additionalProperties: false,
            properties: {
              groupId: { type: "string", example: "Manager" },
              userId: { type: "string", example: "aSmith" },
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
  },

  // ------------------------------------------------------------
  //       project
  // ------------------------------------------------------------
  projectList: {
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
                          id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "Build a town-project" },
                          description: { type: "string", example: "A town should be built" },
                          assignee: { type: "string", example: "aSmith" },
                          projectedBudgets: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                organization: { type: "string", example: "MyOrga" },
                                value: { type: "string", example: "1234" },
                                currencyCode: { type: "string", example: "EUR" },
                              },
                            },
                          },
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
                            createdBy: { type: "string", example: "aSmith" },
                            createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              additionalProperties: true,
                              properties: {
                                project: {
                                  type: "object",
                                  properties: {
                                    id: {
                                      type: "string",
                                      example: "d0e8c69eg298c87e3899119e025eff1f",
                                    },
                                    creationUnixTs: { type: "string", example: "1536154645775" },
                                    status: { type: "string", example: "open" },
                                    displayName: {
                                      type: "string",
                                      example: "Build a town-project",
                                    },
                                    description: {
                                      type: "string",
                                      example: "A town should be built",
                                    },
                                    assignee: { type: "string", example: "aSmith" },
                                    projectedBudgets: {
                                      type: "array",
                                      items: {
                                        type: "object",
                                        properties: {
                                          organization: { type: "string", example: "MyOrga" },
                                          value: { type: "string", example: "1234" },
                                          currencyCode: { type: "string", example: "EUR" },
                                        },
                                      },
                                    },
                                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                  },
                                },
                                permissions: {
                                  type: "object",
                                  additionalProperties: true,
                                  example: {
                                    "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                  },
                                },
                              },
                            },
                            snapshot: {
                              type: "object",
                              properties: {
                                displayName: {
                                  type: "string",
                                  example: "Build a town-project",
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
  },

  projectViewDetails: {
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
                        id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                        creationUnixTs: { type: "string", example: "1536154645775" },
                        status: { type: "string", example: "open" },
                        displayName: { type: "string", example: "Build a town-project" },
                        description: { type: "string", example: "A town should be built" },
                        assignee: { type: "string", example: "aSmith" },
                        projectedBudgets: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              organization: { type: "string", example: "MyOrga" },
                              value: { type: "string", example: "1234" },
                              currencyCode: { type: "string", example: "EUR" },
                            },
                          },
                        },
                        billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
                        exchangeRate: { type: "string", example: "1.0" },
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
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            properties: {
                              project: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    example: "d0e8c69eg298c87e3899119e025eff1f",
                                  },
                                  creationUnixTs: { type: "string", example: "1536154645775" },
                                  status: { type: "string", example: "open" },
                                  displayName: {
                                    type: "string",
                                    example: "Build a town-project",
                                  },
                                  description: {
                                    type: "string",
                                    example: "A town should be built",
                                  },
                                  billingDate: {
                                    type: "string",
                                    example: "2018-12-11T00:00:00.000Z",
                                  },
                                  exchangeRate: { type: "string", example: "1.0" },
                                  assignee: { type: "string", example: "aSmith" },
                                  projectedBudgets: {
                                    type: "array",
                                    items: {
                                      type: "object",
                                      properties: {
                                        organization: { type: "string", example: "MyOrga" },
                                        value: { type: "string", example: "1234" },
                                        currencyCode: { type: "string", example: "EUR" },
                                      },
                                    },
                                  },
                                  thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                },
                              },
                              permissions: {
                                type: "object",
                                additionalProperties: true,
                                example: {
                                  "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                },
                              },
                              snapshot: {
                                type: "object",
                                properties: {
                                  displayName: {
                                    type: "string",
                                    example: "townproject",
                                  },
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
  },

  projectAssign: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
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
  },

  projectUpdate: {
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
            additionalProperties: false,
            properties: {
              displayName: { type: "string", example: "townproject" },
              description: { type: "string", example: "A town should be built" },
              assignee: { type: "string", example: "aSmith" },
              projectedBudgets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    organization: { type: "string", example: "MyOrga" },
                    value: { type: "string", example: "1234" },
                    currencyCode: { type: "string", example: "EUR" },
                  },
                },
              },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
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
  },

  projectClose: {
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
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
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
  },

  createSubproject: {
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
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subproject: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                  status: { type: "string", example: "open" },
                  displayName: { type: "string", example: "townproject" },
                  description: { type: "string", example: "A town should be built" },
                  assignee: { type: "string", example: "aSmith" },
                  currency: { type: "string", example: "EUR" },
                  projectedBudgets: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        organization: { type: "string", example: "MyOrga" },
                        value: { type: "string", example: "1234" },
                        currencyCode: { type: "string", example: "EUR" },
                      },
                    },
                  },
                  additionalData: { type: "object", additionalProperties: true },
                },
                required: ["displayName"],
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
  },

  projectViewHistory: {
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
          offset: {
            type: "string",
          },
          limit: {
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
                      createdBy: { type: "string", example: "aSmith" },
                      createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                      dataVersion: { type: "string", example: "1" },
                      data: {
                        type: "object",
                        additionalProperties: true,
                        example: { identity: "aSmith", intent: "subproject.viewDetails" },
                        properties: {
                          permissions: {
                            type: "object",
                            additionalProperties: true,
                            example: { "subproject.intent.listPermissions": ["aSmith", "jDoe"] },
                          },
                        },
                      },
                      snapshot: {
                        type: "object",
                        properties: {
                          displayName: { type: "string", example: "townproject" },
                        },
                      },
                    },
                  },
                },
                historyItemsCount: {
                  type: "number",
                  example: 10,
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  projectListPermissions: {
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
                "project.viewDetails": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  projectGrantPermission: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: {
                type: "string",
                enum: projectIntents,
                example: "project.intent.listPermissions",
              },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
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
  },

  projectRevokePermission: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
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
  },

  // ------------------------------------------------------------
  //       subproject
  // ------------------------------------------------------------
  subprojectList: {
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
                          id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          displayName: { type: "string", example: "school" },
                          description: { type: "string", example: "school should be built" },
                          assignee: { type: "string", example: "aSmith" },
                          currency: { type: "string", example: "EUR" },
                          projectedBudgets: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                organization: { type: "string", example: "MyOrga" },
                                value: { type: "string", example: "1234" },
                                currencyCode: { type: "string", example: "EUR" },
                              },
                            },
                          },
                          thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                          additionalData: { type: "object", additionalProperties: true },
                        },
                      },
                      log: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            key: { type: "string" },
                            intent: { type: "string", example: "global.createProject" },
                            createdBy: { type: "string", example: "aSmith" },
                            createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                            dataVersion: { type: "string", example: "1" },
                            data: {
                              type: "object",
                              properties: {
                                subproject: {
                                  type: "object",
                                  properties: {
                                    id: {
                                      type: "string",
                                      example: "d0e8c69eg298c87e3899119e025eff1f",
                                    },
                                    creationUnixTs: { type: "string", example: "1536154645775" },
                                    status: { type: "string", example: "open" },
                                    displayName: { type: "string", example: "school" },
                                    billingDate: {
                                      type: "string",
                                      example: "2018-12-11T00:00:00.000Z",
                                    },
                                    exchangeRate: { type: "string", example: "1.0" },
                                    description: {
                                      type: "string",
                                      example: "school should be built",
                                    },
                                    assignee: { type: "string", example: "aSmith" },
                                    currency: { type: "string", example: "EUR" },
                                    projectedBudgets: {
                                      type: "array",
                                      items: {
                                        type: "object",
                                        properties: {
                                          organization: { type: "string", example: "MyOrga" },
                                          value: { type: "string", example: "1234" },
                                          currencyCode: { type: "string", example: "EUR" },
                                        },
                                      },
                                    },
                                    thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                  },
                                },
                                permissions: {
                                  type: "object",
                                  additionalProperties: true,
                                  example: {
                                    "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                  },
                                },
                                snapshot: {
                                  type: "object",
                                  properties: {
                                    displayName: { type: "string", example: "school" },
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
  },

  subprojectViewDetails: {
    schema: {
      description: "Retrieve details about a specific subproject.",
      tags: ["subproject"],
      summary: "View details",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            example: "d0e8c69eg298c87e3899119e025eff1f",
          },
          subprojectId: {
            type: "string",
            example: "rfe8er9eg298c87e3899119e025eff1f",
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
                  properties: {
                    id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                    displayName: { type: "string", example: "townproject" },
                  },
                },
                subproject: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
                        creationUnixTs: { type: "string", example: "1536154645775" },
                        status: { type: "string", example: "open" },
                        displayName: { type: "string", example: "school" },
                        description: { type: "string", example: "school should be built" },
                        assignee: { type: "string", example: "aSmith" },
                        currency: {
                          type: "string",
                          description: "contract currency",
                          example: "EUR",
                        },
                        projectedBudgets: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              organization: { type: "string", example: "MyOrga" },
                              value: { type: "string", example: "1234" },
                              currencyCode: { type: "string", example: "EUR" },
                            },
                          },
                        },
                        additionalData: { type: "object", additionalProperties: true },
                      },
                    },
                    log: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          intent: { type: "string", example: "global.createProject" },
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            properties: {
                              subproject: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    example: "d0e8c69eg298c87e3899119e025eff1f",
                                  },
                                  creationUnixTs: { type: "string", example: "1536154645775" },
                                  status: { type: "string", example: "open" },
                                  displayName: { type: "string", example: "school" },
                                  description: {
                                    type: "string",
                                    example: "school should be built",
                                  },
                                  billingDate: {
                                    type: "string",
                                    example: "2018-12-11T00:00:00.000Z",
                                  },
                                  exchangeRate: { type: "string", example: "1.0" },
                                  assignee: { type: "string", example: "aSmith" },
                                  currency: { type: "string", example: "EUR" },
                                  projectedBudgets: {
                                    type: "array",
                                    items: {
                                      type: "object",
                                      properties: {
                                        organization: { type: "string", example: "MyOrga" },
                                        value: { type: "string", example: "1234" },
                                        currencyCode: { type: "string", example: "EUR" },
                                      },
                                    },
                                  },
                                  thumbnail: { type: "string", example: "/Thumbnail_0001.jpg" },
                                },
                              },
                              permissions: {
                                type: "object",
                                additionalProperties: true,
                                example: {
                                  "subproject.intent.listPermissions": ["aSmith", "jDoe"],
                                },
                              },
                              snapshot: {
                                type: "object",
                                properties: {
                                  displayName: { type: "string", example: "school" },
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
  },

  subprojectAssign: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
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
  },

  subprojectUpdate: {
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
            additionalProperties: false,
            properties: {
              displayName: { type: "string", example: "school" },
              description: { type: "string", example: "school should be built" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: "string", example: "EUR" },
              projectedBudgets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    organization: { type: "string", example: "MyOrga" },
                    value: { type: "string", example: "1234" },
                    currencyCode: { type: "string", example: "EUR" },
                  },
                },
              },
              additionalData: { type: "object" },
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
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
  },

  subprojectClose: {
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
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
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
  },

  reorderWorkflowitems: {
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
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
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
  },

  createWorkflowitem: {
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
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
              status: { type: "string", example: "open" },
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build classroom" },
              amount: { type: ["string", "null"], example: "500" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: ["string", "null"], example: "EUR" },
              amountType: { type: "string", example: "disbursed" },
              billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              dueDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              exchangeRate: { type: "string", example: "1.0" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "classroom-contract" },
                    base64: { type: "string", example: "dGVzdCBiYXNlNjRTdHJpbmc=" },
                  },
                },
              },
              additionalData: { type: "object", additionalProperties: true },
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
                projectId: { type: "string" },
                subprojectId: { type: "string" },
                workflowitemId: { type: "string" },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  subprojectViewHistory: {
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
          offset: {
            type: "string",
          },
          limit: {
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
                      createdBy: { type: "string", example: "aSmith" },
                      createdAt: { type: "string", example: "2018-09-05T13:37:25.775Z" },
                      dataVersion: { type: "string", example: "1" },
                      data: {
                        type: "object",
                        additionalProperties: true,
                        example: {
                          subproject: {
                            id: "er58c69eg298c87e3899119e025eff1f",
                            creationUnixTs: "1536834568552",
                            status: "open",
                            displayName: "school",
                            description: "school should be built",
                            assignee: "aSmith",
                            currency: "EUR",
                            projectedBudgets: [
                              {
                                organization: "ACMECorp",
                                value: "500",
                                currencyCode: "EUR",
                              },
                            ],
                          },
                        },
                        properties: {
                          permissions: {
                            type: "object",
                            additionalProperties: true,
                            example: { "subproject.intent.listPermissions": ["aSmith", "jDoe"] },
                          },
                        },
                      },
                      snapshot: {
                        type: "object",
                        properties: {
                          displayName: { type: "string", example: "classroom" },
                          amountType: { type: "string", example: "disbursed" },
                          amount: { type: "string", example: "500" },
                          currency: { type: "string", example: "EUR" },
                        },
                      },
                    },
                  },
                },
                historyItemsCount: {
                  type: "number",
                  example: 10,
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  subprojectListPermissions: {
    schema: {
      description: "See the permissions for a given subproject.",
      tags: ["subproject"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            example: "er58c69eg298c87e3899119e025eff1f",
          },
          subprojectId: {
            type: "string",
            example: "4j28c69eg298c87e3899119e025eff1f",
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
                "project.viewDetails": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  subprojectGrantPermission: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "3r28c69eg298c87e3899119e025eff1f" },
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
  },

  subprojectRevokePermission: {
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
            additionalProperties: false,
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
              type: "string",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  workflowitemList: {
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
                          id: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
                          creationUnixTs: { type: "string", example: "1536154645775" },
                          status: { type: "string", example: "open" },
                          amountType: { type: "string", example: "disbursed" },
                          displayName: { type: "string", example: "classroom" },
                          description: { type: "string", example: "build a classroom" },
                          amount: { type: "string", example: "500" },
                          assignee: { type: "string", example: "aSmith" },
                          currency: { type: "string", example: "EUR" },
                          billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
                          dueDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
                          exchangeRate: { type: "string", example: "1.0" },
                          workflowitemType: { type: "string", example: "general" },
                          documents: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", example: "classroom-contract" },
                                hash: {
                                  type: "string",
                                  example:
                                    "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
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
  },
  workflowitemAssign: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "e528c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "9w88c69eg298c87e3899119e025eff1f" },
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
  },
  workflowitemUpdate: {
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
            additionalProperties: false,
            properties: {
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build a classroom" },
              amountType: { type: "string", example: "disbursed" },
              amount: { type: "string", example: "500" },
              currency: { type: "string", example: "EUR" },
              exchangeRate: { type: "string", example: "1.0" },
              assignee: { type: "string", example: "aSmith" },
              projectId: { type: "string", example: "3r28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "myId" },
                    base64: {
                      type: "string",
                      example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
                    },
                  },
                },
              },
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
  },
  workflowitemClose: {
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
            additionalProperties: false,
            properties: {
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "5z28c69eg298c87e3899119e025eff1f" },
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
  },

  workflowitemListPermissions: {
    schema: {
      description: "See the permissions for a given workflowitem.",
      tags: ["workflowitem"],
      summary: "List all permissions",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            example: "4j28c69eg298c87e3899119e025eff1f",
          },
          subprojectId: {
            type: "string",
            example: "5t28c69eg298c87e3899119e025eff1f",
          },
          workflowitemId: {
            type: "string",
            example: "6z28c69eg298c87e3899119e025eff1f",
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
                "project.viewDetails": ["aSmith", "jDoe"],
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },
  workflowitemGrantPermissions: {
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
        additionalProperties: false,
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "6z28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
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
  },
  workflowitemRevokePermissions: {
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
            additionalProperties: false,
            properties: {
              identity: { type: "string", example: "aSmith" },
              intent: { type: "string", example: "global.createProject" },
              projectId: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "5t28c69eg298c87e3899119e025eff1f" },
              workflowitemId: { type: "string", example: "6z28c69eg298c87e3899119e025eff1f" },
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
  },
  validateDocument: {
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
            additionalProperties: false,
            properties: {
              base64String: {
                type: "string",
                example: "aGVsbG8gdGhpcyBpcyBhIHRlc3QgZm9yIHRoZSBhcGkgZG9j",
              },
              hash: {
                type: "string",
                example: "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
              },
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
                isIdentical: { type: "boolean", example: true },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },
  notificationPoll: {
    schema: {
      description: "Poll the newest notifications that happened before a certain id",
      tags: ["notification"],
      summary: "Poll the newest notifications that happened before a certain id",
      security: [
        {
          bearerToken: [],
        },
      ],
      querystring: {
        type: "object",
        properties: {
          beforeId: {
            type: "string",
            example: "2cfd0663-1770-4184-974e-63129061d389",
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
                            id: { type: "string", example: "bd552d12c64539aa80293d315191490c" },
                            type: { type: "string", example: "project" },
                            displayName: { type: "string", example: "Amazonas Fund 53" },
                          },
                        },
                      },
                      isRead: { type: "boolean" },
                      originalEvent: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          intent: { type: "string", example: "global.createProject" },
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-24T12:02:58.763Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            additionalProperties: true,
                            example: {
                              project: {
                                id: "fe9c2b24ade9a92360b3a898665678ac",
                                creationUnixTs: "1536834480274",
                                status: "open",
                                displayName: "town-project",
                                description: "a town should be built",
                                assignee: "aSmith",
                                currency: "EUR",
                                projectedBudgets: [
                                  {
                                    organization: "ACMECorp",
                                    value: "10000",
                                    currencyCode: "EUR",
                                  },
                                ],
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
  },

  notificationList: {
    schema: {
      description:
        "List notifications for the selected page " +
        "for the user, given by the token in the " +
        "request's `Authorization` header. ",
      tags: ["notification"],
      summary: "List all notification of the authorized user",
      security: [
        {
          bearerToken: [],
        },
      ],
      querystring: {
        type: "object",
        properties: {
          limit: {
            type: "string",
            example: "10",
          },
          offset: {
            type: "string",
            example: "0",
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
                            id: { type: "string", example: "bd552d12c64539aa80293d315191490c" },
                            type: { type: "string", example: "project" },
                            displayName: { type: "string", example: "Amazonas Fund 53" },
                          },
                        },
                      },
                      isRead: { type: "boolean" },
                      originalEvent: {
                        type: "object",
                        properties: {
                          key: { type: "string" },
                          intent: { type: "string", example: "global.createProject" },
                          createdBy: { type: "string", example: "aSmith" },
                          createdAt: { type: "string", example: "2018-09-24T12:02:58.763Z" },
                          dataVersion: { type: "string", example: "1" },
                          data: {
                            type: "object",
                            additionalProperties: true,
                            example: {
                              project: {
                                id: "fe9c2b24ade9a92360b3a898665678ac",
                                creationUnixTs: "1536834480274",
                                status: "open",
                                displayName: "town-project",
                                description: "a town should be built",
                                assignee: "aSmith",
                                currency: "EUR",
                                projectedBudgets: [
                                  {
                                    organization: "ACMECorp",
                                    value: "10000",
                                    currencyCode: "EUR",
                                  },
                                ],
                                thumbnail: "/Thumbnail_0001.jpg",
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                unreadNotificationCount: {
                  type: "number",
                },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },

  notificationCount: {
    schema: {
      description:
        "Get the unread and the total number of notifications for the currently logged in user",
      tags: ["notification"],
      summary: "Get the unread and the total number of notifications",
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
                unreadNotificationCount: { type: "integer", example: 0 },
                notificationCount: { type: "integer", example: 0 },
              },
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },
  markRead: {
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
            additionalProperties: false,
            properties: {
              notificationId: { type: "string", example: "2cfd0663-1770-4184-974e-63129061d389" },
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
  },
  markMultipleRead: {
    schema: {
      description:
        "Allows the user to mark multiple notifications as read, which " +
        "is then reflected by the `isRead` flag carried in the `notification.list` response.",
      tags: ["notification"],
      summary: "Mark multiple notification as read",
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
            additionalProperties: false,
            properties: {
              notificationIds: {
                type: "array",
                items: { type: "string", example: "2cfd0663-1770-4184-974e-63129061d389" },
              },
            },
            required: ["notificationIds"],
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
  },
  registerNode: {
    schema: {
      description: "Used by non-alpha MultiChain nodes to register their wallet address.",
      tags: ["network"],
      summary: "Register a node",
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              address: { type: "string" },
              organization: { type: "string" },
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
            apiVersion: { type: "string", example4: "1.0" },
            data: {
              type: "object",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },
  declineNode: {
    schema: {
      description: "A user declines a node's request to connect to the network",
      tags: ["network"],
      summary: "Decline a node's request",
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            properties: {
              node: {
                type: "object",
                properties: {
                  address: { type: "string", example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM" },
                  organization: { type: "string", example: "Alice's Solutions & Co" },
                },
                required: ["address", "organization"],
              },
            },
            required: ["node"],
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
        401: getAuthErrorSchema(),
      },
    },
  },

  voteForPermission: {
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
            additionalProperties: false,
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
              type: "object",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },
  approveNewOrganization: {
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
            additionalProperties: false,
            properties: {
              organization: { type: "string", example: "Alice's Solutions & Co" },
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
              type: "object",
            },
          },
        },
        401: getAuthErrorSchema(),
      },
    },
  },
  approveNewNodeForExistingOrganization: {
    schema: {
      description:
        "Approves a new node for an existing organization." +
        " This organization doesn't have to go through the voting system again",
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
            additionalProperties: false,
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
              type: "object",
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
  },
  networkList: {
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
                          organization: { type: "string", example: "Alice's Solutions & Co" },
                        },
                      },
                      myVote: { type: "string", example: "admin" },
                      isConnected: { type: "boolean", example: true },
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
                                organization: {
                                  type: "string",
                                  example: "Alice's Solutions & Co",
                                },
                              },
                            },
                          },
                          decliners: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                address: {
                                  type: "string",
                                  example: "1CaWV7nTVwAd8bTzcPBBSQRZgbXLd9K8faM9QM",
                                },
                                organization: {
                                  type: "string",
                                  example: "Alice's Solutions & Co",
                                },
                              },
                            },
                          },
                        },
                      },
                      lastSeen: {
                        type: "string",
                        example: "2021-02-11",
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
  },
  listActive: {
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
  },
  createBackup: {
    schema: {
      description: "Create a backup",
      tags: ["system"],
      summary: "Create a Backup",
      security: [
        {
          bearerToken: [],
        },
      ],
      response: {
        200: {
          description: "file download backup.gz",
          type: "string",
          // format: "binary",
          example: "backup.gz",
        },
      },
    },
  },

  restoreBackup: {
    schema: {
      description:
        "To restore a backup send a valid backup.gz file as binary via an API-Testing-Tool like postman." +
        "Use 'application/gzip' as content type header)",
      tags: ["system"],
      summary: "Restore a Backup",
      security: [
        {
          bearerToken: [],
        },
      ],
      consumes: ["application/gzip"],
      body: {
        // type=string + format=binary is not supported by fastify-swagger.
        // Instead, we use the `AnyValue` schema, which allows anything.
        AnyValue: {
          description: "backup.gz (binary gzip file)",
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
        401: getAuthErrorSchema(),
      },
    },
  },
};

export function getSchema(server, id): Schema {
  const schema = schemas[id];
  return {
    preValidation: [server.authenticate],
    ...schema,
  };
}
export function getSchemaWithoutAuth(id): Schema {
  const schema = schemas[id];
  return {
    ...schema,
  };
}
