import * as Ajv from "ajv";
import * as fastify from "fastify";

import { IncomingMessage, Server, ServerResponse } from "http";
const DEFAULT_API_VERSION = "1.0";

const ajv = new Ajv({
  // the fastify defaults (if needed)
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
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
      reply.status(401).send({
        apiVersion: DEFAULT_API_VERSION,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." },
      });
    }
  });
};

const registerSwagger = (server: fastify.FastifyInstance, urlPrefix: string, apiPort: Number) => {
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
      host: `localhost:${apiPort.toString()}`,
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

export const createBasicApp = (jwtSecret: string, urlPrefix: string, apiPort: Number) => {
  const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    // logger: true,
  });

  server.setSchemaCompiler(schema => {
    const validator = ajv.compile(schema);
    return data => {
      let valid;
      if (process.env.NODE_ENV === "prod") {
        const d1 = JSON.stringify(data, null, 2);
        valid = validator(data);
        const d2 = JSON.stringify(data, null, 2);

        if (d1 !== d2) {
          console.log("ALERT!: Redacted additional payload paramters!");
          console.log("Original Payload: \n", d1);
          console.log("Redacted Payload: \n", d2);
        }
      } else {
        valid = validator(data);
      }
      return valid;
    };
  });
  registerSwagger(server, urlPrefix, apiPort);
  addTokenHandling(server, jwtSecret);

  // app.use(logging);
  return server;
};
