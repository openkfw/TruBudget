import isEqual = require("lodash.isequal");
import uuid = require("uuid");
import { VError } from "verror";

import { config } from "../../../config";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import {
  DocumentOrExternalLinkReference,
  GenericDocument,
  hashDocument,
  UploadedDocument,
  UploadedDocumentOrLink,
} from "../document/document";
import { File } from "../document/document_upload";
import { isDocumentLink } from "../document/workflowitem_document_delete";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";

import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import * as WorkflowitemUpdated from "./workflowitem_updated";

export interface RequestData {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  documents?: UploadedDocumentOrLink[];
  additionalData?: object;
  tags?: string[];
  fundingOrganization?: string;
}

export type EventData = WorkflowitemUpdated.Modification;
export const requestDataSchema = WorkflowitemUpdated.modificationSchema;

interface Repository {
  getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;
  uploadDocumentToStorageService(file: File): Promise<Result.Type<BusinessEvent[]>>;
  getAllDocumentReferences(): Promise<Result.Type<GenericDocument[]>>;
}

function docIdAlreadyExists(allDocuments: GenericDocument[], docId: string): boolean {
  return allDocuments.some((doc) => doc.id === docId);
}

function generateUniqueDocId(allDocuments: GenericDocument[]): string {
  logger.trace("Generation unique document id");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const docId = uuid.v4();
    if (!docIdAlreadyExists(allDocuments, docId)) {
      return docId;
    }
  }
}

export async function updateWorkflowitem(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  modification: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  const documents: DocumentOrExternalLinkReference[] = [];
  const documentUploadedEvents: BusinessEvent[] = [];

  if (modification.documents && modification.documents.length > 0) {
    const documentsCount = modification.documents.filter((d) => d.hasOwnProperty("base64")).length;

    if (
      config.documentFeatureEnabled ||
      (documentsCount === 0 && config.documentExternalLinksEnabled)
    ) {
      const existingDocuments = await repository.getAllDocumentReferences();
      if (Result.isErr(existingDocuments)) {
        return new VError(existingDocuments, "cannot get documents");
      }

      logger.trace("Preparing workflowitem_updated event");
      // preparation for workflowitem_updated event
      for (const doc of modification.documents || []) {
        doc.id = generateUniqueDocId(existingDocuments);
        if (!isDocumentLink(doc)) {
          const hashedDocumentResult = await hashDocument(doc as UploadedDocument);
          if (Result.isErr(hashedDocumentResult)) {
            return new VError(hashedDocumentResult, `cannot hash document ${doc.id} `);
          }
          documents.push(hashedDocumentResult);
        } else {
          doc.lastModified = new Date().toISOString();
          documents.push(doc);
        }
      }
      // upload documents to storage service
      // generate document events (document_uploaded, secret_published)
      const onlyDocuments = modification.documents.filter(
        (d) => "base64" in d,
      ) as UploadedDocument[];

      const documentUploadedEventsResults: Result.Type<BusinessEvent[]>[] = await Promise.all(
        onlyDocuments.map(async (d) => {
          return repository.uploadDocumentToStorageService({
            id: d.id,
            fileName: d.fileName || "",
            documentBase64: d.base64,
            comment: d.comment,
          });
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
  const modificationWithStoredDocuments: EventData = {
    ...modification, // including UploadedDocuments
    documents: documents.length <= 0 ? undefined : documents,
  };
  const newEvent = WorkflowitemUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    modificationWithStoredDocuments,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(newEvent)) {
    return new VError(newEvent, "cannot update workflowitem");
  }

  logger.trace({ issuer }, "Checking if user has permissions");
  if (issuer.id !== "root") {
    const intent = "workflowitem.update";
    if (!Workflowitem.permits(workflowitem, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: workflowitem });
    }
  }

  logger.trace({ event: newEvent }, "Checking event validity");
  const updatedWorkflowitemResult = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    newEvent,
  );
  if (Result.isErr(updatedWorkflowitemResult)) {
    return new VError(updatedWorkflowitemResult, "new event validation failed");
  }
  const updatedWorkflowitem = updatedWorkflowitemResult;

  // Only emit the event if it causes any changes:
  if (isEqualIgnoringLog(workflowitem, updatedWorkflowitemResult)) {
    return { newEvents: [], workflowitem };
  }

  logger.trace("Creating notification events");
  let notifications: Result.Type<NotificationCreated.Event[]> = [];
  if (workflowitem.assignee !== undefined) {
    const recipientsResult = await repository.getUsersForIdentity(workflowitem.assignee);
    if (Result.isErr(recipientsResult)) {
      return new VError(recipientsResult, `fetch users for ${workflowitem.assignee} failed`);
    }
    notifications = recipientsResult.reduce((notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          newEvent,
          projectId,
          undefined,
          undefined,
          new Date().toISOString(),
          issuer.metadata,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create notification event");
        }
        notifications.push(notification);
      }
      return notifications;
    }, [] as NotificationCreated.Event[]);
  }
  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }

  const workflowitemTypeEventsResult = repository.applyWorkflowitemType(newEvent, workflowitem);

  if (Result.isErr(workflowitemTypeEventsResult)) {
    return new VError(workflowitemTypeEventsResult, "failed to apply workflowitem type");
  }
  const workflowitemTypeEvents = workflowitemTypeEventsResult;

  return {
    newEvents: [newEvent, ...documentUploadedEvents, ...notifications, ...workflowitemTypeEvents],
    workflowitem: updatedWorkflowitem,
  };
}

function isEqualIgnoringLog(
  workflowitemA: Workflowitem.Workflowitem,
  workflowitemB: Workflowitem.Workflowitem,
): boolean {
  const { log: logA, ...a } = workflowitemA;
  const { log: logB, ...b } = workflowitemB;
  return isEqual(a, b);
}
