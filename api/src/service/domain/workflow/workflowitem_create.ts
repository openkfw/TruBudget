import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { workflowitemIntents } from "../../../authz/intents";
import { config } from "../../../config";
import * as Result from "../../../result";
import { randomString } from "../../hash";
import * as AdditionalData from "../additional_data";
import { BusinessEvent } from "../business_event";
import {
  DocumentReference,
  GenericDocument,
  hashDocument,
  UploadedDocument,
  uploadedDocumentSchema,
} from "../document/document";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import Type, { workflowitemTypeSchema } from "../workflowitem_types/types";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemCreated from "./workflowitem_created";
import uuid = require("uuid");

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

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
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
  uploadDocumentToStorageService(
    fileName: string,
    documentBase64: string,
    docId: string,
  ): Promise<Result.Type<BusinessEvent[]>>;
  getAllDocumentReferences(): Promise<Result.Type<GenericDocument[]>>;
}

function docIdAlreadyExists(allDocuments: GenericDocument[], docId: string) {
  return allDocuments.some((doc) => doc.id === docId);
}

function generateUniqueDocId(allDocuments: GenericDocument[]): string {
  // Generate a new document id
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const docId = uuid.v4();
    if (!docIdAlreadyExists(allDocuments, docId)) {
      return docId;
    }
  }
}

export async function createWorkflowitem(
  ctx: Ctx,
  creatingUser: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const publisher = creatingUser.id;
  const workflowitemId = reqData.workflowitemId || randomString();
  const documents: DocumentReference[] = [];
  const documentUploadedEvents: BusinessEvent[] = [];

  if (reqData.documents) {
    if (config.documentFeatureEnabled) {
      logger.trace(
        { req: reqData },
        "Trying to hash documents in preparation for workflowitem_created event",
      );
      const existingDocuments = await repository.getAllDocumentReferences();
      if (Result.isErr(existingDocuments)) {
        return new VError(existingDocuments, "cannot get documents");
      }
      // preparation for workflowitem_created event
      for (const doc of reqData.documents || []) {
        doc.id = generateUniqueDocId(existingDocuments);
        const hashedDocumentResult = await hashDocument(doc);
        if (Result.isErr(hashedDocumentResult)) {
          return new VError(hashedDocumentResult, `cannot hash document ${doc.id} `);
        }
        documents.push(hashedDocumentResult);
      }
      // upload documents to storage service
      // generate document events (document_uploaded, secret_published)
      const documentUploadedEventsResults: Result.Type<BusinessEvent[]>[] = await Promise.all(
        reqData.documents.map(async (document) => {
          logger.trace({ document }, "Trying to upload document to storage service");
          return repository.uploadDocumentToStorageService(
            document.fileName || "",
            document.base64,
            document.id,
          );
        }),
      );
      for (const result of documentUploadedEventsResults) {
        if (Result.isErr(result)) {
          // Only returns the first error occurred
          return result;
        }
        documentUploadedEvents.push(...result);
      }
    } else {
      return new VError("Cannot upload documents, the document feature is not enabled");
    }
  }

  logger.trace({ req: reqData }, "Trying to create 'WorkflowitemCreated' Event from request data");
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

  logger.trace({ req: reqData }, "Check if Workflowitem exists");
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

  logger.trace({ user: creatingUser }, "Checking if user is authorized");
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

  logger.trace({ event: workflowitemCreated }, "Checking if Event is valid");
  const result = WorkflowitemCreated.createFrom(ctx, workflowitemCreated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, workflowitemCreated, [result]);
  }

  logger.trace({ subproject }, "Checking the workflowitem type");
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
