import * as crypto from "crypto";
import Joi = require("joi");

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import * as AdditionalData from "../additional_data";
import { StoredDocument, UploadedDocument, uploadedDocumentSchema } from "./document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import { sourceSubprojects } from "./subproject_eventsourcing";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemCreated from "./workflowitem_created";
import { sourceWorkflowitems } from "./workflowitem_eventsourcing";

/**
 * Initial data for the new project as given in the request.
 *
 * Looks a lot like `InitialData` in the domain layer's `project_created.ts`, except
 * that there are more optional fields that get initialized using default values.
 */
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

export async function createWorkflowitem(
  ctx: Ctx,
  creatingUser: ServiceUser,
  subprojectEvents: BusinessEvent[],
  reqData: RequestData,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
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

  const { subprojects } = sourceSubprojects(ctx, subprojectEvents);
  const subproject = subprojects.find(x => x.id === reqData.subprojectId);
  if (subproject === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "subproject", reqData.subprojectId)] };
  }

  // Check authorization (if not root):
  if (creatingUser.id !== "root") {
    const isAuthorized = (subproject.permissions["subproject.createWorkflowitem"] || []).some(
      identity => canAssumeIdentity(creatingUser, identity),
    );
    if (!isAuthorized) {
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, creatingUser.id, workflowitemCreated)],
      };
    }
  }

  const { errors } = sourceWorkflowitems(ctx, [workflowitemCreated]);
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, workflowitemCreated, errors)] };
  }

  return { newEvents: [workflowitemCreated], errors: [] };
}

async function hashDocument(document: UploadedDocument): Promise<StoredDocument> {
  return hashBase64String(document.base64).then(hashValue => ({
    id: document.id,
    hash: hashValue,
  }));
}

async function hashBase64String(base64String: string): Promise<string> {
  return new Promise<string>(resolve => {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
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
