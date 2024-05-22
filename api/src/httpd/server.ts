// eslint-disable-next-line import/order
import { useAzureTelemetry } from "./instrumentation";
useAzureTelemetry(); // has to be imported before fastify and called

import { IncomingMessage, Server, ServerResponse } from "http";
import * as path from "path";

import fastifyCookie, { FastifyCookieOptions } from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyJwt from "@fastify/jwt";
import * as fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import Ajv from "ajv";
import { fastify, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyMetricsPlugin from "fastify-metrics";
import { Ctx } from "lib/ctx";
import { ConnToken } from "service";
import { MAX_DOCUMENT_SIZE } from "service/domain/document/document";
import { Identity } from "service/domain/organization/identity";
import { ServiceUser } from "service/domain/organization/service_user";

import { JwtConfig } from "../config";
import logger from "../lib/logger";
import * as Result from "../result";
import * as Group from "../service/domain/organization/group";
import { AugmentedFastifyInstance } from "../types";

import { AuthenticatedRequest } from "./lib";

const DEFAULT_API_VERSION = "1.0";

const ajv = new Ajv({
  // the fastify defaults (if needed)
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  // any other options
  // strict: "log"
  // strictSchema: "log",
  // ...
  keywords: ["example"],
});

const addTokenHandling = (server: FastifyInstance, jwt: JwtConfig): void => {
  server.register(fastifyCookie, {
    parseOptions: {},
  } as FastifyCookieOptions);

  if (jwt.algorithm === "RS256") {
    server.register(fastifyJwt, {
      secret: {
        private: Buffer.from(jwt.secretOrPrivateKey, "base64"),
        public: Buffer.from(jwt.publicKey, "base64"),
      },
      sign: {
        algorithm: jwt.algorithm,
      },
      cookie: {
        cookieName: "token",
        signed: false,
      },
    });
  } else {
    server.register(fastifyJwt, {
      secret: jwt.secretOrPrivateKey,
      cookie: {
        cookieName: "token",
        signed: false,
      },
    });
  }

  server.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (request.cookies.token) {
        request.headers.authorization = `Bearer ${request.cookies.token}`;
      }
      await request.jwtVerify();
    } catch (err) {
      logger.error(err, "Authentication error");
      request.log.debug(err, "Authentication error");
      reply.status(401).send({
        apiVersion: DEFAULT_API_VERSION,
        error: { code: 401, message: "A valid JWT auth bearer token is required for this route." },
      });
    }
  });
};

const addLogging = (server: FastifyInstance): void => {
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

export const addGroupsPreHandler = async (
  server: FastifyInstance,
  conn: ConnToken,
  groupsFn: (
    conn: ConnToken,
    ctx: Ctx,
    serviceUser: ServiceUser,
    targetUserId: Identity,
  ) => Promise<Result.Type<Group.Group[]>>,
): Promise<void> => {
  server.addHook("preHandler", async (request: AuthenticatedRequest, reply) => {
    if (request.user && !request.user.groups) {
      try {
        const ctx = { requestId: request.id, source: "http" };
        const user = {
          id: request.user?.userId,
          groups: request.user?.groups,
          address: request.user?.address,
          metadata: request.user?.metadata,
        };
        const groupsResult = await groupsFn(conn, ctx, user, user.id);
        if (Result.isErr(groupsResult)) {
          throw new Error(groupsResult.message);
        }
        const groups = groupsResult;
        request.user.groups = groups.map((group) => group.id);
      } catch (err) {
        logger.error({ err }, `preHandler failed to get groups for user ${request.user?.userId}`);
      }
    }
  });
};

const registerSwagger = (server: FastifyInstance, urlPrefix: string, _apiPort: number): void => {
  server.register(fastifySwagger, {
    // Swagger documentation is available at: http://localhost:8080/api/documentation/static/index.html
    swagger: {
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [
        { name: "default" },
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
    openapi: {
      info: {
        title: "TruBudget API documentation",
        description:
          "The documentation contains all endpoints used for TruBudget blockchain communication.\n" +
          "Start at the 'user.authenticate' endpoint to receive a token which is needed for authentication \n" +
          "at almost every endpoint.\nTo use the token click on the 'Authorize' Button at the top right.\n",
        version: "1.0.0",
      },
      components: {
        securitySchemes: {
          bearerToken: {
            type: "apiKey",
            description:
              "Authenticate yourself using the user.authenticate endpoint.\n\n" +
              "Afterwards put in the token with a 'Bearer ' prefix and click 'Authorize'\n\n",
            name: "Authorization",
            in: "header",
          },
        },
      },
    },
    hideUntagged: false,
  });

  server.register(fastifySwaggerUi, {
    // Swagger documentation is available at: http://localhost:8080/api/documentation/static/index.html
    routePrefix: `${urlPrefix}/documentation`,
    uiConfig: {
      docExpansion: "list",
    },
  });
};

export const createBasicApp = (
  jwt: JwtConfig,
  urlPrefix: string,
  apiPort: number,
  accessControlAllowOrigin: string,
  rateLimit: number | undefined,
): FastifyInstance => {
  const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger,
    bodyLimit: MAX_DOCUMENT_SIZE,
  });

  registerSwagger(server, urlPrefix, apiPort);

  server.setValidatorCompiler(({ schema }) => ajv.compile(schema));
  server.register(fastifyMetricsPlugin, { endpoint: "/metrics" });
  server.register(fastifyCors, { origin: accessControlAllowOrigin });
  server.register(fastifyStatic, { root: path.join(__dirname, "public") });

  // It is important that swagger is registered first in order for a swaggerSCP object to exist on the instance
  server.register(fastifyHelmet, (instance) => {
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

  addTokenHandling(server, jwt);
  addLogging(server);

  server.addContentTypeParser("application/gzip", async function (request, payload) {
    request.headers["content-length"] = "1024mb";
    return payload;
  });

  if (rateLimit) {
    server.register(fastifyRateLimit, {
      max: rateLimit,
      timeWindow: "1 minute",
    });
  }

  // todo file size limit
  server.register(fastifyMultipart, {
    // attachFieldsToBody: "keyValues",
    // onFile,
    // routes that use Multipart Form
    prefix: "/v2/subproject.createWorkflowitem",
  });

  return server;
};

async function onFile(part) {
  const buff = (await part.toBuffer()).toString();
  part.value = {
    id: "",
    filename: part.filename,
    content: buff,
  };
}
