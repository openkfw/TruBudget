import * as bodyParser from "body-parser";
import * as fastify from "fastify";
import * as jsonwebtoken from "jsonwebtoken";
import { AuthToken } from "../authz/token";

import { IncomingMessage, Server, ServerResponse } from "http";
const DEFAULT_API_VERSION = "1.0";

const addTokenHandling = (server: fastify.FastifyInstance, jwtSecret: string) => {
  server.register(require("fastify-jwt"), {
    secret: jwtSecret,
  });

  server.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        apiVersion: DEFAULT_API_VERSION,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." },
      });
    }
  });
};

const registerSwagger = (server: fastify.FastifyInstance) => {
  server.register(require("fastify-swagger"), {
    routePrefix: "/api/documentation",
    swagger: {
      info: {
        title: "TruBudget API documentation",
        description:
          "The documentation contains all endpoints used for TruBudget blockchain communication." +
          "\nStart at the 'user.authenticate' endpoint to receive a token which is needed for authentication " +
          "at almost every endpoint.\nTo use the token click on the 'Authorize' Button at the top right",
        version: "0.1.0",
      },
      host: "localhost:8080",
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

export const createBasicApp = (jwtSecret: string) => {
  const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({});
  registerSwagger(server);
  addTokenHandling(server, jwtSecret);

  // app.use(logging);
  return server;
};
