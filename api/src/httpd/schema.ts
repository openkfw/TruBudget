import { FastifySchema } from "fastify";

export interface SwaggerSchema extends FastifySchema {
  description: string;
  tags: string[];
  summary: string;
  security?: { [securityLabel: string]: string[] }[] | undefined;
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

function getAuthErrorSchema(): Object {
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

function getSuccessfulSchema(): { description: string; type: string } {
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

  timestamps :{
    schema: {
      description: "Returns the latest 10 timestamps",
      tags: ["system"],
      summary: "Get timestamps",
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
                timestamps: {
                  type: "array",
                  items: {
                    type: "number",
                    example: 1613000000,
                  },
                },
              },
            },
          },
        },
      },
    }
  },

  registerNode: {
    schema: {
      description: "Used by non-alpha MultiChain nodes to register their wallet address.",
      tags: ["network"],
      summary: "Register a node",
      security: [
        {
          bearerToken: [],
        },
      ],
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
