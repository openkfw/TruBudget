import * as Ajv from "ajv";
import * as fastify from "fastify";
import * as metricsPlugin from "fastify-metrics";
import logger from "../lib/logger";
const rawBody = require("raw-body");

import { IncomingMessage, Server, ServerResponse } from "http";
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
      schemes: ["http"],
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
    const validator = ajv.compile(schema);
    return data => {
      let valid;
      if (env !== "production") {
        const d1 = JSON.stringify(data, null, 2);
        valid = validator(data);
        const d2 = JSON.stringify(data, null, 2);

        if (d1 !== d2) {
          logger.warn("ALERT!: Redacted additional payload paramters!");
          logger.warn("Original Payload: \n", d1);
          logger.warn("Redacted Payload: \n", d2);
        }
      } else {
        valid = validator(data);
      }
      return valid;
    };
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
