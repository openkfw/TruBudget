import * as Ajv from "ajv";
import * as fastify from "fastify";
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

const addTokenHandling = (server: fastify.FastifyInstance, jwtSecret: string) => {
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

const addLogging = (server: fastify.FastifyInstance) => {
  server.addHook("preHandler", (req, _reply, done) => {
    logger.debug({
      id: req.id,
      url: req.req.url,
      params: req.params,
    });
    done();
  });
  server.addHook("onSend", (req, reply, payload, done) => {
    // let jsonPayload;
    // try {
    //   jsonPayload = JSON.parse(payload);
    // } catch (e) {
    //   logger.warn(e, "Error during parsing of payload");
    //   jsonPayload = payload;
    // }

    logger.debug({
      id: req.id,
      status: reply.res.statusCode,
      message: reply.res.statusMessage,
      payload,
    });
    done();
  });
};

const registerSwagger = (
  server: fastify.FastifyInstance,
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
  env: string,
) => {
  const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger: false,
    bodyLimit: 104857600,
  });

  server.setSchemaCompiler(schema => {
    return ajv.compile(schema);
  });

  server.register(metricsPlugin, { endpoint: "/metrics" });

  registerSwagger(server, urlPrefix, apiPort, swaggerBasePath);

  addTokenHandling(server, jwtSecret);
  addLogging(server);

  server.addContentTypeParser("application/gzip", (req, done) => {
    rawBody(
      req,
      {
        length: req.headers["content-length"],
        limit: "1024mb",
      },
      (err, body) => {
        if (err) return done(err);
        done(null, body);
      },
    );
  });

  // app.use(logging);
  return server;
};
