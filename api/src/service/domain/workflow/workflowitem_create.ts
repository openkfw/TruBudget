import Joi = require("joi");
import { VError } from "verror";
import Intent, { workflowitemIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import Type, { workflowitemTypeSchema } from "../workflowitem_types/types";
import { hashDocument, StoredDocument, UploadedDocument, uploadedDocumentSchema } from "./document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemCreated from "./workflowitem_created";
import * as WorkflowitemDocumentUploaded from "./workflowitem_document_uploaded";

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
  workflowitemType?: Type;
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
  dueDate: Joi.date().iso().allow(""),
  assignee: Joi.string(),
  documents: Joi.array().items(uploadedDocumentSchema),
  additionalData: AdditionalData.schema,
  workflowitemType: workflowitemTypeSchema,
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
  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;
}

export async function createWorkflowitem(
  ctx: Ctx,
  creatingUser: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const documents: StoredDocument[] = [];
  for (const doc of reqData.documents || []) {
    const hashedDocumentResult = await hashDocument(doc);
    if (Result.isErr(hashedDocumentResult)) {
      return new VError(
        hashedDocumentResult,
        "failed to create workflowitem, permission check failed",
      );
    }
    documents.push(hashedDocumentResult);
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
      workflowitemType: reqData.workflowitemType || "general",
    },
  );
  if (Result.isErr(workflowitemCreated)) {
    return new VError(workflowitemCreated, "failed to create workflowitem created event");
  }

  // Check if workflowitemId already exists
  if (
    await repository.workflowitemExists(
      reqData.projectId,
      reqData.subprojectId,
      workflowitemCreated.workflowitem.id,
    )
  ) {
    return new AlreadyExists(ctx, workflowitemCreated, workflowitemCreated.workflowitem.id);
  }

  const subprojectResult = await repository.getSubproject(reqData.projectId, reqData.subprojectId);
  if (Result.isErr(subprojectResult)) {
    return new VError(subprojectResult, "failed to get subproject");
  }
  const subproject = subprojectResult;

  // Check authorization
  if (creatingUser.id === "root") {
    return new PreconditionError(
      ctx,
      workflowitemCreated,
      "user 'root' is not allowed to create workflowitems",
    );
  }
  const intent = "subproject.createWorkflowitem";
  if (!Subproject.permits(subproject, creatingUser, [intent])) {
    return new NotAuthorized({ ctx, userId: creatingUser.id, intent, target: subproject });
  }

  // Check that the event is valid:
  const result = WorkflowitemCreated.createFrom(ctx, workflowitemCreated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, workflowitemCreated, [result]);
  }

  // handle new documents
  const documentUploadedEventsResults: Result.Type<BusinessEvent>[] = documents.map((d, i) => {
    const docToUpload: UploadedDocument = {
      base64: reqData.documents ? reqData.documents[i].base64 : "",
      fileName:
        reqData.documents && reqData.documents[i].fileName
          ? reqData.documents[i].fileName
          : "uploaded_file.pdf",
      id: d.documentId,
    };

    const workflowitemEvent = WorkflowitemDocumentUploaded.createEvent(
      ctx.source,
      publisher,
      reqData.projectId,
      reqData.subprojectId,
      workflowitemId,
      docToUpload,
    );
    if (Result.isErr(workflowitemEvent)) {
      return new VError(workflowitemEvent, "failed to create event");
    }

    // Check that the event is valid:
    const result = WorkflowitemDocumentUploaded.createFrom(ctx, workflowitemEvent);
    if (Result.isErr(result)) {
      return new InvalidCommand(ctx, workflowitemEvent, [result]);
    }
    return workflowitemEvent;
  });

  const documentUploadedEvents: BusinessEvent[] = [];
  for (const result of documentUploadedEventsResults) {
    if (Result.isErr(result)) {
      return result;
    }
    documentUploadedEvents.push(result);
  }

  // Check the workflowitem type
  if (
    subproject.workflowitemType !== undefined &&
    workflowitemCreated.workflowitem.workflowitemType !== subproject.workflowitemType
  ) {
    return new PreconditionError(
      ctx,
      workflowitemCreated,
      `only the subproject's workflowitem type may be used: ${subproject.workflowitemType}`,
    );
  }

  const workflowitemTypeEvents = repository.applyWorkflowitemType(workflowitemCreated, result);

  if (Result.isErr(workflowitemTypeEvents)) {
    return new VError(workflowitemTypeEvents, "failed to apply workflowitem type");
  }

  return [workflowitemCreated, ...documentUploadedEvents, ...workflowitemTypeEvents];

  function newDefaultPermissionsFor(userId: string): Permissions {
    // The user can always do anything anyway:
    if (userId === "root") return {};
    const intents: Intent[] = workflowitemIntents;
    return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
  }
}
