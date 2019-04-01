import { FastifyInstance } from "fastify";
import Joi = require("joi");
import { VError } from "verror";

import { toHttpError } from "./http_errors";
import * as NotAuthenticated from "./http_errors/not_authenticated";
import { AuthenticatedRequest } from "./httpd/lib";
import { Ctx } from "./lib/ctx";
import * as Result from "./result";
import { ServiceUser } from "./service/domain/organization/service_user";
import { ResourceMap } from "./service/domain/ResourceMap";
import { UploadedDocument } from "./service/domain/workflow/document";
import * as Project from "./service/domain/workflow/project";
import * as Subproject from "./service/domain/workflow/subproject";
import { Id } from "./service/domain/workflow/workflowitem";
import * as WorkflowitemCreate from "./service/workflowitem_create";

interface RequestBodyV1 {
  apiVersion: "1.0";
  data: {
    projectId: Project.Id;
    subprojectId: Subproject.Id;
    status?: "open" | "closed";
    displayName: string;
    description?: string;
    assignee?: string;
    currency?: string;
    amount?: string;
    amountType: "N/A" | "disbursed" | "allocated";
    billingDate?: string;
    exchangeRate?: string;
    documents?: UploadedDocument[];
    additionalData?: object;
  };
}

const requestBodyV1Schema = Joi.object({
  apiVersion: Joi.valid("1.0").required(),
  data: Joi.object({
    projectId: Project.idSchema,
    subprojectId: Subproject.idSchema,
    status: Joi.valid("open", "closed"),
    displayName: Joi.string().required(),
    description: Joi.string().allow(""),
    assignee: Joi.string(),
    currency: Joi.string(),
    amount: Joi.string(),
    amountType: Joi.string().required(),
    billingDate: Joi.string(),
    exchangeRate: Joi.string(),
    documents: Joi.array().items(Joi.object().keys({ id: Joi.string(), base64: Joi.string() })),
    additionalData: Joi.object(),
  }).required(),
});

type RequestBody = RequestBodyV1;
const requestBodySchema = Joi.alternatives([requestBodyV1Schema]);

function validateRequestBody(body: any): Result.Type<RequestBody> {
  const { error, value } = Joi.validate(body, requestBodySchema);
  return !error ? value : error;
}

function mkSwaggerSchema(server: FastifyInstance) {
  return {
    beforeHandler: [(server as any).authenticate],
    schema: {
      description:
        "Create a workflowitem and associate it to the given subproject.\n.\n" +
        "Note that the only possible values for 'amountType' are: 'disbursed', 'allocated', 'N/A'\n.\n" +
        "The only possible values for 'status' are: 'open' and 'closed'",
      tags: ["subproject"],
      summary: "Create a workflowitem",
      security: [
        {
          bearerToken: [],
        },
      ],
      body: {
        type: "object",
        properties: {
          apiVersion: { type: "string", example: "1.0" },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["projectId", "subprojectId", "displayName", "amountType"],
            properties: {
              projectId: { type: "string", example: "d0e8c69eg298c87e3899119e025eff1f" },
              subprojectId: { type: "string", example: "er58c69eg298c87e3899119e025eff1f" },
              status: { type: "string", example: "open" },
              displayName: { type: "string", example: "classroom" },
              description: { type: "string", example: "build classroom" },
              amount: { type: ["string", "null"], example: "500" },
              assignee: { type: "string", example: "aSmith" },
              currency: { type: ["string", "null"], example: "EUR" },
              amountType: { type: "string", example: "disbursed" },
              billingDate: { type: "string", example: "2018-12-11T00:00:00.000Z" },
              exchangeRate: { type: "string", example: "1.0" },
              documents: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "classroom-contract" },
                    base64: { type: "string", example: "dGVzdCBiYXNlNjRTdHJpbmc=" },
                  },
                },
              },
              additionalData: { type: "object", additionalProperties: true },
            },
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
                project: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                  },
                },
                subproject: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                  },
                },
                workflowitem: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
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

interface Service {
  createWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    createRequest: WorkflowitemCreate.RequestData,
  ): Promise<ResourceMap>;
}

export function addHttpHandler(server: FastifyInstance, urlPrefix: string, service: Service) {
  server.post(
    `${urlPrefix}/subproject.createWorkflowitem`,
    mkSwaggerSchema(server),
    (request, reply) => {
      const ctx: Ctx = { requestId: request.id, source: "http" };

      const user: ServiceUser = {
        id: (request as AuthenticatedRequest).user.userId,
        groups: (request as AuthenticatedRequest).user.groups,
      };

      const bodyResult = validateRequestBody(request.body);

      if (Result.isErr(bodyResult)) {
        const { code, body } = toHttpError(new VError(bodyResult, "failed to create workflowitem"));
        reply.status(code).send(body);
        return;
      }

      const reqData: WorkflowitemCreate.RequestData = {
        projectId: bodyResult.data.projectId,
        subprojectId: bodyResult.data.subprojectId,
        status: bodyResult.data.status,
        displayName: bodyResult.data.displayName,
        description: bodyResult.data.description,
        assignee: bodyResult.data.assignee,
        currency: bodyResult.data.currency,
        amount: bodyResult.data.amount,
        amountType: bodyResult.data.amountType,
        billingDate: bodyResult.data.billingDate,
        exchangeRate: bodyResult.data.exchangeRate,
        documents: bodyResult.data.documents,
      };

      service
        .createWorkflowitem(ctx, user, reqData)
        .then((resourceIds: ResourceMap) => {
          const code = 200;
          const body = {
            apiVersion: "1.0",
            data: {
              ...resourceIds,
            },
          };
          reply.status(code).send(body);
        })
        .catch(err => {
          const { code, body } = toHttpError(err);
          reply.status(code).send(body);
        });
    },
  );
}
