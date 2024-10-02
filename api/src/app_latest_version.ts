import * as fs from "fs";

import axios from "axios";
import Joi = require("joi");
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { assertUnreachable } from "./lib/assertUnreachable";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { AuthToken } from "./service/domain/organization/auth_token";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as UserCreate from "./service/domain/organization/user_create";
import { DOCKERHUB_TRUBUDGET_TAGS_URL } from "./system/constants";
import { AugmentedFastifyInstance } from "./types";

/**
 * Represents the request body of the endpoint
 */
interface RequestBodyV1 {
  apiVersion: "1.0";
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({}),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

/**
 * Validates the request body of the http request
 *
 * @param body the request body
 * @returns the request body wrapped in a {@link Result.Type}. Contains either the object or an error
 */
function validateRequestBody(body: unknown): Result.Type<RequestBody> {
  const { error, value } = requestBodySchema.validate(body);
  return !error ? value : error;
}

/**
 * Creates the swagger schema for the `/global.appUpgrade` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Get latest app version available on dockerhub.",
      tags: ["global"],
      summary: "Get latest app version",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        required: ["apiVersion"],
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
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
                version: { type: "string", example: "2.15.0" },
                message: { type: "string", example: "App is not upgradable" },
              },
            },
          },
        },
        401: NotAuthenticated.schema,
      },
    },
  };
}

/**
 * Represents the service that stored version to upgrade to
 */
interface Service {
  storeUpgradeVersion(
    ctx: Ctx,
    serviceUser: ServiceUser,
    requestData: UserCreate.RequestData,
  ): Promise<Result.Type<AuthToken>>;
}

/**
 * Creates an http handler that handles incoming http requests for the `/app.upgrade` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(server: AugmentedFastifyInstance, urlPrefix: string): void {
  server.register(async function () {
    server.post(`${urlPrefix}/app.latestVersion`, mkSwaggerSchema(server), (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const serviceUser: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
        address: (request as AuthenticatedRequest).user.address,
      };

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(new VError(bodyResult, "failed to get new app version"));
        request.log.error({ err: bodyResult }, "Invalid request body");
        reply.status(code).send(body);
        return;
      }

      // Check if user is root
      if (serviceUser.id !== "root") {
        const { body } = toHttpError(
          new VError("User is not root", "failed to get new app version"),
        );
        request.log.error({ err: body }, "User is not root");
        reply.status(403).send(body);
        return;
      }

      // check if it is upgradable app
      const appIsUpgradable = fs.existsSync(__dirname + "/trubudget-config/upgradable.txt");
      if (!appIsUpgradable) {
        reply.status(200).send({
          apiVersion: "1.0",
          data: {
            message: "App is not upgradable",
          },
        });
        return;
      }

      switch (bodyResult.apiVersion) {
        case "1.0": {
          axios.get(DOCKERHUB_TRUBUDGET_TAGS_URL).then((response) => {
            const tags = response.data.results;
            const highestVersion: string | undefined = tags
              .filter(
                (tag: { name: string }): boolean =>
                  tag.name !== "latest" && /^v\d+\.\d+\.\d+$/.test(tag.name),
              )
              .map((tag: { name: string }): string => tag.name)
              .find((): boolean => true);
            const code = 200;
            const body = {
              apiVersion: "1.0",
              data: {
                version: highestVersion,
              },
            };
            reply.status(code).send(body);
          });

          break;
        }
        default:
          // Joi validates only existing apiVersions
          request.log.error({ err: bodyResult }, "Wrong api version specified");
          assertUnreachable(bodyResult.apiVersion);
      }
    });
  });
}
