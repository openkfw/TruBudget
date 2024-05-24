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
import { generateUniqueDocId, GenericDocument, uploadedDocumentSchema } from "../document/document";
import { AlreadyExists } from "../errors/already_exists";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { PreconditionError } from "../errors/precondition_error";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import { Permissions } from "../permissions";
import Type, { workflowitemTypeSchema } from "../workflowitem_types/types";

import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemCreated from "./workflowitem_created";
import { DocumentBase } from "../document/DocumentBase";
import { DocumentReferenceBase } from "../document/DocumentReferenceBase";

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
  documents?: DocumentBase[];
  additionalData?: object;
  workflowitemType?: Type;
  tags?: string[];
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
  tags: Joi.array().items(Project.tagsSchema),
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
  userExists(userId: string): Promise<Result.Type<boolean>>;
  getUser(userId: string): Promise<Result.Type<UserRecord.UserRecord>>;
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;
  uploadDocumentToStorageService(
    uploadedDocument: DocumentBase,
  ): Promise<Result.Type<BusinessEvent[]>>;
  getAllDocumentReferences(): Promise<Result.Type<GenericDocument[]>>;
}

const inheritSubprojectPermissions = (
  workflowitemInitialPermissions: Permissions,
  subprojectPermissions: Permissions,
  workflowitemId?: string,
): Permissions => {
  const result = { ...workflowitemInitialPermissions };
  for (const property in subprojectPermissions) {
    let subprojectPermissionsProperty = property.replace("subproject.", "workflowitem.");

    switch (property) {
      case "subproject.viewDetails":
        continue;
      case "subproject.createWorkflowitem":
        continue;
      case "subproject.reorderWorkflowitems":
        continue;
      case "subproject.budget.updateProjected":
        continue;
      case "subproject.budget.deleteProjected":
        continue;
      default:
        break;
    }

    if (!workflowitemIntents.includes(subprojectPermissionsProperty as Intent)) {
      // won't happen unless Intents are modified and there is an error in the implementation
      logger.error(
        `Workflowitem ${workflowitemId} trying to inherit nonexistent property ${subprojectPermissionsProperty}`,
      );
      continue;
    }

    const permissions = [
      ...new Set([
        ...workflowitemInitialPermissions[subprojectPermissionsProperty],
        ...subprojectPermissions[property],
      ]),
    ];
    Object.defineProperty(result, subprojectPermissionsProperty, {
      value: permissions,
      enumerable: true,
    });
  }
  return result;
};

function numDocuments(docs: DocumentBase[]): number {
  return docs.filter((d) => d.hasOwnProperty("base64") || d.hasOwnProperty("buffer")).length;
}

export async function createWorkflowitem(
  ctx: Ctx,
  issuer: ServiceUser,
  reqData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const publisher = issuer.id;
  const documents: DocumentReferenceBase[] = [];
  const documentUploadedEvents: BusinessEvent[] = [];

  if (reqData.documents?.length) {
    const documentsCount = numDocuments(reqData.documents);
    if (
      config.documentFeatureEnabled ||
      (documentsCount === 0 && config.documentExternalLinksEnabled)
    ) {
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
        documents.push(doc.reference());
        // if ("base64" in doc || "buffer" in doc) {
        //   const hashedDocumentResult = await doc.hash();
        //   if (Result.isErr(hashedDocumentResult)) {
        //     return new VError(hashedDocumentResult, `cannot hash document ${doc.id} `);
        //   }
        //   documents.push(hashedDocumentResult);
        // } else {
        //   documents.push(doc);
        // }
      }
      // upload documents to storage service
      // generate document events (document_uploaded, secret_published)
      const documentUploadedEventsResults: Result.Type<BusinessEvent[]>[] = await Promise.all(
        reqData.documents
          // todo adjust filter method
          .filter((document) => "base64" in document)
          .map(async (document) => {
            logger.trace({ document }, "Trying to upload document to storage service");
            return repository.uploadDocumentToStorageService(document);
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
      id: reqData.workflowitemId || randomString(),
      status: reqData.status || "open",
      displayName: reqData.displayName,
      description: reqData.description || "",
      assignee: reqData.assignee || issuer.id,
      amount: reqData.amount,
      currency: reqData.currency,
      amountType: reqData.amountType,
      exchangeRate: reqData.exchangeRate,
      billingDate: reqData.billingDate,
      dueDate: reqData.dueDate,
      documents,
      permissions: newDefaultPermissionsFor(issuer.id),
      additionalData: reqData.additionalData || {},
      workflowitemType: reqData.workflowitemType || "general",
      tags: reqData.tags || [],
    },
    new Date().toISOString(),
    issuer.metadata,
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

  logger.trace({ item: workflowitemCreated }, "Check if assignee exists");
  const userExistsResult = await repository.userExists(workflowitemCreated.workflowitem.assignee);

  if (Result.isErr(userExistsResult)) {
    return new VError(userExistsResult, "user exists check failed");
  }

  const userExists = userExistsResult;

  if (!userExists) {
    return new PreconditionError(ctx, workflowitemCreated, "assigned user does not exist!");
  }

  const userResult = await repository.getUser(workflowitemCreated.workflowitem.assignee);

  if (Result.isErr(userResult)) {
    return new VError(userResult, "user check failed");
  }

  const userPermissions = userResult.permissions;

  if (!userPermissions["user.authenticate"] || !userPermissions["user.authenticate"].length) {
    return new PreconditionError(
      ctx,
      workflowitemCreated,
      "disabled users are not allowed to be assigned to workflowitems",
    );
  }

  const subprojectResult = await repository.getSubproject(reqData.projectId, reqData.subprojectId);
  if (Result.isErr(subprojectResult)) {
    return new VError(subprojectResult, "failed to get subproject");
  }
  const subproject = subprojectResult;

  logger.trace({ user: issuer }, "Checking if user is authorized");
  if (issuer.id === "root") {
    return new PreconditionError(
      ctx,
      workflowitemCreated,
      "user 'root' is not allowed to create workflowitems",
    );
  }
  const intent = "subproject.createWorkflowitem";
  if (!Subproject.permits(subproject, issuer, [intent])) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
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

  logger.trace({ workflowitemCreated }, "Setting default exchange rate");
  if (
    workflowitemCreated.workflowitem.amountType !== "N/A" &&
    workflowitemCreated.workflowitem.exchangeRate === undefined
  ) {
    workflowitemCreated.workflowitem.exchangeRate = "1.0";
  }

  workflowitemCreated.workflowitem.permissions = inheritSubprojectPermissions(
    workflowitemCreated.workflowitem.permissions,
    subproject.permissions,
    workflowitemCreated.workflowitem.id,
  );

  return [workflowitemCreated, ...documentUploadedEvents, ...workflowitemTypeEvents];

  function newDefaultPermissionsFor(userId: string): Permissions {
    // The user can always do anything anyway:
    if (userId === "root") return {};
    const intents = workflowitemIntents;
    return intents.reduce((obj, intent) => ({ ...obj, [intent]: [userId] }), {});
  }
}
