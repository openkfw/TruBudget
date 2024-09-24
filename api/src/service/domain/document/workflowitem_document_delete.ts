import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { config } from "../../../config";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "../workflow/workflowitem";
import * as WorkflowitemUpdated from "../workflow/workflowitem_updated";
import {
  DocumentOrExternalLinkReference,
  ExternalLinkReference,
  StoredDocument,
  UploadedDocument,
} from "./document";
import * as DocumentDeleted from "./document_deleted";
import * as DocumentShared from "./document_shared";
import VError = require("verror");
import { BusinessEvent } from "../business_event";
import * as WorkflowitemEventSourcing from "../workflow/workflowitem_eventsourcing";

export function isDocumentLink(
  obj: DocumentOrExternalLinkReference | UploadedDocument,
): obj is ExternalLinkReference {
  return "link" in obj;
}

interface DeleteDocumentResponse {
  status: number;
}
interface DeleteDocumentRepository {
  getWorkflowitem(workflowitemId): Promise<Result.Type<Workflowitem.Workflowitem>>;

  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;

  getDocumentInfo(docId: string): Promise<Result.Type<StoredDocument | undefined>>;

  getSecret(docId, organization): Promise<Result.Type<DocumentShared.SecretPublished>>;

  decryptWithKey(secret, privateKey): Promise<Result.Type<string>>;

  getPrivateKey(organization): Promise<Result.Type<string>>;

  deleteDocumentFromStorage(id, secret): Promise<Result.Type<DeleteDocumentResponse>>;

  deleteDocumentFromExternalStorage(
    id,
    secret,
    storageServiceUrl,
  ): Promise<Result.Type<DeleteDocumentResponse>>;
}

async function deleteDocumentFromExternalStorage(
  ctx,
  repository,
  documentId,
  workflowitem,
): Promise<Result.Type<DeleteDocumentResponse>> {
  // Get all events from one document
  logger.trace("Deleting document: ", documentId, " from external storage");

  const documentInfo = await repository.getDocumentInfo(documentId);

  if (!documentInfo || Result.isErr(documentInfo)) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `couldn't get document information from ${workflowitem.displayName}`,
    );
  }

  //get secret from stream
  logger.trace("Fetching secret from stream for document: ", documentId);
  const encryptedSecret = await repository.getSecret(documentId, config.organization);
  if (!encryptedSecret || Result.isErr(encryptedSecret)) {
    return new VError(
      new NotFound(ctx, "secret", documentId),
      `couldn't get secret for document ${documentId} and organization ${config.organization}. Document is not shared with this organization`,
    );
  }

  // decrypt secret with own private key
  logger.trace("Decrypting document secret: ", documentId);

  const privateKeyBase64Result = await repository.getPrivateKey(config.organization);
  if (Result.isErr(privateKeyBase64Result)) {
    return new VError(privateKeyBase64Result, "cannot get private key");
  }
  const privateBuff = Buffer.from(privateKeyBase64Result, "base64");
  const privateKey = privateBuff.toString("utf8");
  const decryptedSecret = await repository.decryptWithKey(
    encryptedSecret.encryptedSecret,
    privateKey,
  );

  if (Result.isErr(decryptedSecret)) {
    return new VError(decryptedSecret, "failed to decrypt secret");
  }

  // send the request to the local storage service
  let documentFromStorage: DeleteDocumentResponse;

  if (config.documentFeatureEnabled && documentInfo.organization === config.organization) {
    documentFromStorage = await repository.deleteDocumentFromStorage(documentId, decryptedSecret);
  } else {
    // send the request to the external storage service
    documentFromStorage = await repository.deleteDocument(
      documentId,
      decryptedSecret,
      documentInfo.organizationUrl,
    );
  }

  if (Result.isErr(documentFromStorage)) {
    return new VError(documentFromStorage, "failed to get document from storage service");
  }

  return documentFromStorage;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Deletes a document.
 * @param ctx - The context.
 * @param user - The user performing the action.
 * @param projectId - The ID of the project.
 * @param subprojectId - The ID of the subproject.
 * @param workflowitemId - The ID of the workflowitem.
 * @param documentId - The ID of the document to delete.
 * @param repository - The repository for deleting the document.
 * @returns A promise that resolves to an object containing the new events.
 */
export async function deleteDocument(
  ctx: Ctx,
  user: ServiceUser,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  documentId: string,
  repository: DeleteDocumentRepository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  logger.trace("Deleting document: ", documentId, "...");

  // Check if the workflowitem exists
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return workflowitem;
  }

  // Check if the workflowitem status is "open"
  if (workflowitem.status !== "open") {
    return new VError('A document can only be deleted from a workflowitem with "open" status');
  }

  // Check if the user has permission to delete the document
  const intent = "workflowitem.list";
  if (!Workflowitem.permits(workflowitem, user, [intent])) {
    return new NotAuthorized({ ctx, userId: user.id, intent, target: workflowitem });
  }

  const document = workflowitem.documents.find((d) => d.id === documentId);
  // Check if the document is linked to the workflowitem
  if (!document) {
    return new VError(
      new NotFound(ctx, "document", documentId),
      `Workflowitem ${workflowitem.displayName} has no link to document`,
    );
  }

  if (isDocumentLink(document)) {
    logger.trace("Document ", documentId, " is a url ...");
  } else {
    logger.trace("Trying to find document: ", documentId, "via storage service ...");

    // Try to delete document from storage service
    const documentFromStorage = await deleteDocumentFromExternalStorage(
      ctx,
      repository,
      documentId,
      workflowitem,
    );

    if (Result.isErr(documentFromStorage)) {
      return new VError(
        new NotFound(ctx, "document", documentId),
        `Error while deleting document from storage for workflowitem ${workflowitem.id} ERROR HERE: ${documentFromStorage}`,
      );
    } else if (!documentFromStorage) {
      return new VError(
        new NotFound(ctx, "document", documentId),
        `Couldn't find document from storage for workflowitem ${workflowitem.id}`,
      );
    }
  }
  // Create a new DocumentDeleted event
  const newDocumentDeleteEvent = DocumentDeleted.createEvent(
    ctx.source,
    user.id,
    documentId,
    undefined,
    user.metadata,
  );

  if (Result.isErr(newDocumentDeleteEvent)) {
    return new VError(newDocumentDeleteEvent, "Cannot delete document");
  }

  // Create a new WorkflowitemUpdated event
  const workflowitemUpdateEvent = WorkflowitemUpdated.createEvent(
    ctx.source,
    user.id,
    projectId,
    subprojectId,
    workflowitemId,
    {
      documentsDeleted: workflowitem.documents.filter((e) => e.id === documentId),
    },
  );

  if (Result.isErr(workflowitemUpdateEvent)) {
    return new VError(workflowitemUpdateEvent, "Cannot update workflowitem");
  }

  logger.trace({ event: workflowitemUpdateEvent }, "Checking event validity");

  // Create a new updated workflowitem
  const updatedWorkflowitemResult = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    workflowitemUpdateEvent,
  );

  if (Result.isErr(updatedWorkflowitemResult)) {
    return new VError(updatedWorkflowitemResult, "New event validation failed");
  }

  const updatedWorkflowitem = updatedWorkflowitemResult;

  // Apply the workflowitem type events
  const workflowitemTypeEventsResult = repository.applyWorkflowitemType(
    workflowitemUpdateEvent,
    workflowitem,
  );

  if (Result.isErr(workflowitemTypeEventsResult)) {
    return new VError(workflowitemTypeEventsResult, "Failed to apply workflowitem type");
  }

  const workflowitemTypeEvents = workflowitemTypeEventsResult;

  return {
    newEvents: [newDocumentDeleteEvent, workflowitemUpdateEvent, ...workflowitemTypeEvents],
  };
}
