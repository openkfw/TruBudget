import Joi = require("joi");
import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import { hashDocument, StoredDocument, UploadedDocument, uploadedDocumentSchema } from "./document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemCreated from "./workflowitem_created";

export interface RequestData {
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId?: Workflowitem.Id;
  status?: "open" | "closed";
  displayName: string;
  description?: string;
  amount?: string;
  currency?: string;
  amountType: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  assignee?: string;
  documents?: UploadedDocument[];
  additionalData?: object;
}

const requestDataSchema = Joi.object({
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: Workflowitem.idSchema,
  status: Joi.string().valid("open", "closed"),
  displayName: Joi.string().required(),
  description: Joi.string().allow(""),
  amount: Joi.string(),
  currency: Joi.string(),
  amountType: Joi.valid("N/A", "disbursed", "allocated").required(),
  exchangeRate: Joi.string(),
  billingDate: Joi.date().iso(),
  dueDate: Joi.date().iso(),
  assignee: Joi.string(),
  documents: Joi.array().items(uploadedDocumentSchema),
  additionalData: AdditionalData.schema,
});

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  workflowitemExists(
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<boolean>;
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function createWorkflowitem(
  ctx: Ctx,
  creatingUser: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; errors: Error[] }>> {
  const documents: StoredDocument[] = [];
  for (const doc of reqData.documents || []) {
    documents.push(await hashDocument(doc));
  }

  const publisher = creatingUser.id;

  const workflowitemId = reqData.workflowitemId || randomString();
  const workflowitemCreated = WorkflowitemCreated.createEvent(
    ctx.source,
    publisher,
    reqData.projectId,
    reqData.subprojectId,
    {
      id: workflowitemId,
      status: reqData.status || "open",
      displayName: reqData.displayName,
      description: reqData.description || "",
      assignee: reqData.assignee || creatingUser.id,
      amount: reqData.amount,
      currency: reqData.currency,
      amountType: reqData.amountType,
      exchangeRate: reqData.exchangeRate,
      billingDate: reqData.billingDate,
      dueDate: reqData.dueDate,
      documents,
      permissions: newDefaultPermissionsFor(creatingUser.id),
      additionalData: reqData.additionalData || {},
    },
  );

  // Check if workflowitemId already exists
  if (
    await repository.workflowitemExists(reqData.projectId, reqData.subprojectId, workflowitemId)
  ) {
    return new PreconditionError(ctx, workflowitemCreated, "workflowitem already exists");
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const authorizationResult = Result.map(
      await repository.getSubproject(reqData.projectId, reqData.subprojectId),
      subproject => {
        const intent = "subproject.createWorkflowitem";
        if (!Subproject.permits(subproject, creatingUser, [intent])) {
          return new NotAuthorized({ ctx, userId: creatingUser.id, intent, target: subproject });
        }
      },
    );
    if (Result.isErr(authorizationResult)) {
      return new VError(
        authorizationResult,
        "failed to create workflowitem, permission check failed",
      );
    }
  }

  // Check that the event is valid by trying to "apply" it:
  const result = WorkflowitemCreated.createFrom(ctx, workflowitemCreated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, workflowitemCreated, [result]);
  }

  return { newEvents: [workflowitemCreated], errors: [] };
}

function newDefaultPermissionsFor(userId: string): Permissions {
  // The user can always do anything anyway:
  if (userId === "root") return {};

  const intents: Intent[] = [
    "workflowitem.intent.listPermissions",
    "workflowitem.intent.grantPermission",
    "workflowitem.intent.revokePermission",
    "workflowitem.view",
    "workflowitem.assign",
    "workflowitem.update",
    "workflowitem.close",
    "workflowitem.archive",
  ];
  return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
}
