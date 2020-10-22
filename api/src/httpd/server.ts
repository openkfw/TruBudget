import * as Ajv from "ajv";
import { fastify, FastifyInstance } from "fastify";
import * as metricsPlugin from "fastify-metrics";
import { IncomingMessage, Server, ServerResponse } from "http";
import rawBody = require("raw-body");

import logger from "../lib/logger";

const DEFAULT_API_VERSION = "1.0";

const ajv = new Ajv({
  // the fastify defaults (if needed)
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  unknownFormats: "ignore",
  // any other options
  // ...
});

const addTokenHandling = (server: FastifyInstance, jwtSecret: string) => {
  server.register(require("fastify-jwt"), {
    secret: jwtSecret,
  });

  server.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      logger.debug({ error: err }, "Authentication error");
      reply.status(401).send({
        apiVersion: DEFAULT_API_VERSION,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." },
      });
    }
  });
};

const addLogging = (server: FastifyInstance) => {
  server.addHook("preHandler", (req, _reply, done) => {
    logger.debug({
      id: req.id,
      url: req.raw.url,
      params: req.params,
    });
    done();
  });
  server.addHook("onSend", (req, reply, payload, done) => {
    logger.debug({
      id: req.id,
      status: reply.raw.statusCode,
      message: reply.raw.statusMessage,
      payload,
    });
    done();
  });
};

const registerSwagger = (
  server: FastifyInstance,
  urlPrefix: string,
  apiPort: number,
  swaggerBasePath: string,
) => {
  server.register(require("fastify-swagger"), {
    // logLevel: "info",
    routePrefix: `${urlPrefix}/documentation`,
    swagger: {
      info: {
        title: "TruBudget API documentation",
        description:
          "The documentation contains all endpoints used for TruBudget blockchain communication." +
          "\nStart at the 'user.authenticate' endpoint to receive a token which is needed for authentication " +
          "at almost every endpoint.\nTo use the token click on the 'Authorize' Button at the top right",
        version: "0.1.0",
      },
      basePath: `${swaggerBasePath}`,
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      securityDefinitions: {
        bearerToken: {
          type: "apiKey",
          description:
            "Authenticate yourself using the user.authenticate endpoint.\n" +
            "Afterwards put in the token with a 'Bearer ' prefix and click 'Authorize'\n",
          name: "Authorization",
          in: "header",
        },
      },
      tags: [
        { name: "global" },
        { name: "group" },
        { name: "network" },
        { name: "notification" },
        { name: "project" },
        { name: "subproject" },
        { name: "system" },
        { name: "user" },
        { name: "workflowitem" },
      ],
    },
    exposeRoute: true,
  });
};

export const createBasicApp = (
  jwtSecret: string,
  urlPrefix: string,
  apiPort: number,
  swaggerBasePath: string,
) => {
  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger: false,
    bodyLimit: 104857600,
  });

  server.setValidatorCompiler(({ schema, method, url, httpPart }) => ajv.compile(schema));

  server.register(metricsPlugin, { endpoint: "/metrics" });

  registerSwagger(server, urlPrefix, apiPort, swaggerBasePath);

  addTokenHandling(server, jwtSecret);
  addLogging(server);

  server.addContentTypeParser("application/gzip", async function (request, payload) {
    request.headers["content-length"] = "1024mb";
    return payload; 
  });

  // app.use(logging);
  return server;
};
