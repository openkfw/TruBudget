import { RequestGenericInterface } from "fastify";
import { AugmentedFastifyInstance } from "./types";
import { VError } from "verror";
import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { AuthenticatedRequest } from "./httpd/lib";
import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { Ctx } from "./lib/ctx";
import { toUnixTimestampStr } from "./lib/datetime";
import { isNonemptyString } from "./lib/validation";
import * as Result from "./result";
import { DocumentOrExternalLinkReference } from "./service/domain/document/document";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Workflowitem from "./service/domain/workflow/workflowitem";
import Type from "./service/domain/workflowitem_types/types";
import { extractUser } from "./handlerUtils";

/**
 * Creates the swagger schema for the `/workflowitem.viewDetails` endpoint
 *
 * @param server fastify server
 * @returns the swagger schema for this endpoint
 */
function mkSwaggerSchema(server: AugmentedFastifyInstance): Object {
  return {
    preValidation: [server.authenticate],
    schema: {
      description: "Retrieve details about a specific workflowitem",
      tags: ["workflowitem"],
      summary: "View details",
      querystring: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          subprojectId: {
            type: "string",
          },
          workflowitemId: {
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
                workflowitem: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "4j28c69eg298c87e3899119e025eff1f" },
                        creationUnixTs: { type: "string", example: "1536154645775" },
                        status: { type: "string", example: "open" },
                        rejectReason: { type: "string", example: "I do not accept the price" },
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
                              hash: {
                                type: "string",
                                example:
                                  "F315FAA31B5B70089E7F464E718191EAF5F93E61BB5FDCDCEF32AF258B80B4B2",
                              },
                              link: {
                                type: "string",
                                example: "https://www.example.com",
                              },
                              fileName: { type: "string", example: "myFile.pdf" },
                              id: {
                                type: "string",
                                example: "abc-cde-adf",
                                additionalProperties: true,
                              },
                              available: { type: "boolean", example: true },
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
    rejectReason?: string;
    amountType: "N/A" | "disbursed" | "allocated" | null;
    displayName: string | null;
    description: string | null;
    amount: string | null | undefined;
    assignee: string | null;
    currency: string | null | undefined;
    billingDate: string | null | undefined;
    dueDate: string | null | undefined;
    exchangeRate: string | null | undefined;
    documents: DocumentOrExternalLinkReference[];
    additionalData: object;
    workflowitemType: Type | undefined;
  };
}

/**
 * Represents the service that returns the details of a workflowitem
 */
interface Service {
  getWorkflowitemDetails(
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem>>;
}

interface Request extends RequestGenericInterface {
  Querystring: {
    projectId: string;
    subprojectId: string;
    workflowitemId: string;
  };
}

function sendErrorIfEmpty(reply, resourceId): string | undefined {
  if (!isNonemptyString(resourceId)) {
    const message = `required query parameter ${resourceId} not present (must be non-empty string)`;
    reply.status(400).send({
      apiVersion: "1.0",
      error: {
        code: 400,
        message,
      },
    });
    return message;
  }
  return;
}

/**
 * Creates an http handler that handles incoming http requests for the `/workflowitem.viewDetails` route
 *
 * @param server the current fastify server instance
 * @param urlPrefix the prefix of the http url
 * @param service the service {@link Service} object used to offer an interface to the domain logic
 */
export function addHttpHandler(
  server: AugmentedFastifyInstance,
  urlPrefix: string,
  service: Service,
): void {
  server.register(async function () {
    server.get<Request>(
      `${urlPrefix}/workflowitem.viewDetails`,
      mkSwaggerSchema(server),
      (request, reply) => {
        const ctx: Ctx = { requestId: request.id, source: "http" };

        const user = extractUser(request as AuthenticatedRequest);

        const projectId = request.query.projectId;
        const subprojectId = request.query.subprojectId;
        const workflowitemId = request.query.workflowitemId;

        const message =
          sendErrorIfEmpty(reply, projectId) ||
          sendErrorIfEmpty(reply, subprojectId) ||
          sendErrorIfEmpty(reply, workflowitemId);

        if (message) {
          request.log.error({ err: message }, "Invalid request body");
          return;
        }

        service
          .getWorkflowitemDetails(ctx, user, projectId, subprojectId, workflowitemId)
          .then((workflowitemResult) => {
            if (Result.isErr(workflowitemResult)) {
              throw new VError(workflowitemResult, "workflowitem.list failed");
            }
            const workflowitem = workflowitemResult;
            const allowedIntents = workflowitem.isRedacted
              ? []
              : getAllowedIntents([user.id].concat(user.groups), workflowitem.permissions);

            const exposedWorkflowitem: ExposedWorkflowitem = {
              allowedIntents,
              data: {
                id: workflowitem.id,
                creationUnixTs: toUnixTimestampStr(workflowitem.createdAt),
                status: workflowitem.status,
                rejectReason: workflowitem.rejectReason,
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
            return exposedWorkflowitem;
          })
          .then((workflowitem: ExposedWorkflowitem) => {
            const code = 200;
            const body = {
              apiVersion: "1.0",
              data: {
                workflowitem,
              },
            };
            reply.status(code).send(body);
          })
          .catch((err) => {
            const { code, body } = toHttpError(err);
            request.log.error({ err }, "Error while getting workflowitem details");
            reply.status(code).send(body);
          });
      },
    );
  });
}
