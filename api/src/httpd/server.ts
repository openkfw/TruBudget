import Ajv from "ajv";
import { fastify, FastifyInstance } from "fastify";
import fastifyMetricsPlugin from "fastify-metrics";
import { IncomingMessage, Server, ServerResponse } from "http";
import { AugmentedFastifyInstance } from "types";
import logger from "../lib/logger";
import { AuthenticatedRequest } from "./lib";

const path = require("path");
const DEFAULT_API_VERSION = "1.0";

const ajv = new Ajv({
  // the fastify defaults (if needed)
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  // strictSchema: "log",
  // any other options
  // ...
  keywords: ["example"],
});

const addTokenHandling = (server: FastifyInstance, jwtSecret: string) => {
  server.register(require("@fastify/jwt"), {
    secret: jwtSecret,
  });

  server.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      request.log.debug(err, "Authentication error");
      reply.status(401).send({
        apiVersion: DEFAULT_API_VERSION,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." },
      });
    }
  });
};

const addLogging = (server: FastifyInstance) => {
  server.addHook("preHandler", (req, _reply, done) => {
    req.log.debug({
      id: req.id,
      url: req.raw.url,
      params: req.params,
      user: (req as AuthenticatedRequest).user,
    });
    done();
  });
  server.addHook("onSend", (req, reply, payload, done) => {
    req.log.debug({
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
  _apiPort: number,
  swaggerBasePath: string,
) => {
  server.register(require("@fastify/swagger"), {
    // http://localhost:8080/api/documentation/static/index.html
    routePrefix: `${urlPrefix}/documentation`,
    swagger: {
      info: {
        title: "TruBudget API documentation",
        description:
          "The documentation contains all endpoints used for TruBudget blockchain communication." +
          "\nStart at the 'user.authenticate' endpoint to receive a token which is needed for authentication " +
          "at almost every endpoint.\nTo use the token click on the 'Authorize' Button at the top right",
        version: "1.0.0",
      },
      host: "localhost",
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
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) {
        next();
      },
      preHandler: function (_request, _reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    exposeRoute: true,
  });

  // server.swagger();
};

export const createBasicApp = (
  jwtSecret: string,
  urlPrefix: string,
  apiPort: number,
  swaggerBasePath: string,
  accessControlAllowOrigin: string,
) => {
  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger,
    bodyLimit: 104857600,
  });

  server.setValidatorCompiler(({ schema }) => ajv.compile(schema));
  server.register(fastifyMetricsPlugin, { endpoint: "/metrics" });
  server.register(require("@fastify/cors"), { origin: accessControlAllowOrigin });
  server.register(require("@fastify/static"), { root: path.join(__dirname, "public") });

  registerSwagger(server, urlPrefix, apiPort, swaggerBasePath);

  // It is important that swagger is registered first in order for a swaggerSCP object to exist on the instance
  server.register(require("@fastify/helmet"), (instance) => {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "validator.swagger.io"],
          scriptSrc: ["'self'"].concat((instance as AugmentedFastifyInstance).swaggerCSP.script),
          styleSrc: ["'self'", "https:"].concat(
            (instance as AugmentedFastifyInstance).swaggerCSP.style,
          ),
        },
      },
    };
  });

  addTokenHandling(server, jwtSecret);
  addLogging(server);

  server.addContentTypeParser("application/gzip", async function (request, payload) {
    request.headers["content-length"] = "1024mb";
    return payload;
  });

  return server;
};
