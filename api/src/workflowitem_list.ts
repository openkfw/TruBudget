import { FastifyInstance, RequestGenericInterface } from "fastify";
import { VError } from "verror";

import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import { toUnixTimestampStr } from "./lib/datetime";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import Type from "./service/domain/workflowitem_types/types";

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    preValidation: [(server as any).authenticate],
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
                          additionalData: { type: "object", additionalProperties: true },
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
                                documentId: {
                                  type: "string",
                                  example: "abc-cde-adf",
                                  additionalProperties: true,
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
        401: NotAuthenticated.schema,
      },
    },
  };
}

interface ExposedWorkflowitem {
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    status: "open" | "closed";
    amountType: "N/A" | "disbursed" | "allocated";
    displayName: string;
    description: string;
    amount: string;
    assignee: string;
    currency: string;
    billingDate: string;
    dueDate: string;
    exchangeRate: string;
    documents: [{ id: string; hash: string; documentId: string }];
    additionalData: object;
    workflowitemType: Type;
  };
}

interface Service {
  listWorkflowitems(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem[]>>;
}

function sendErrorIfEmpty(reply, resourceId) {
  if (!isNonemptyString(resourceId)) {
    reply.status(400).send({
      apiVersion: "1.0",
      error: {
        code: 400,
        message: `required query parameter ${resourceId} not present (must be non-empty string)`,
      },
    });
    return true;
  }
  return false;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
  };
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.get<Request>(
    `${urlPrefix}/workflowitem.list`,
    mkSwaggerSchema(server),
    (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const projectId = request.query.projectId;
      const subprojectId = request.query.subprojectId;
      if (sendErrorIfEmpty(reply, projectId) || sendErrorIfEmpty(reply, subprojectId)) {
        return;
      }

      service
        .listWorkflowitems(ctx, user, projectId, subprojectId)
        .then((workflowitemsResult) => {
          if (Result.isErr(workflowitemsResult)) {
            throw new VError(workflowitemsResult, "workflowitem.list failed");
          }
          const workflowitems = workflowitemsResult;

          return workflowitems.map((workflowitem) => {
            return {
              allowedIntents: workflowitem.isRedacted
                ? []
                : getAllowedIntents([user.id].concat(user.groups), workflowitem.permissions),
              data: {
                id: workflowitem.id,
                creationUnixTs: toUnixTimestampStr(workflowitem.createdAt),
                status: workflowitem.status,
                amountType: workflowitem.amountType,
                displayName: workflowitem.displayName,
                description: workflowitem.description,
                amount: workflowitem.amount,
                assignee: workflowitem.assignee,
                currency: workflowitem.currency,
                billingDate: workflowitem.billingDate,
                dueDate: workflowitem.dueDate,
                exchangeRate: workflowitem.exchangeRate,
                documents: workflowitem.documents,
                additionalData: workflowitem.additionalData,
                workflowitemType: workflowitem.workflowitemType,
              },
            };
          });
        })
        .then((workflowitems: ExposedWorkflowitem[]) => {
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              workflowitems,
            },
          };
          reply.status(code).send(body);
        })
        .catch((err) => {
          const { code, body } = toHttpError(err);
          reply.status(code).send(body);
        });
    },
  );
}
