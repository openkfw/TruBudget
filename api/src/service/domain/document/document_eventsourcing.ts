import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as DocumentUploaded from "./document_uploaded";
import * as WorkflowitemDocumentUploaded from "./workflowitem_document_uploaded";
import * as DocumentShared from "./document_shared";
import { UploadedDocument } from "./document";
import { applyStorageServiceUrls as applyStorageServiceUrl } from "./storage_service_url_eventsourcing";
import logger from "lib/logger";

export function sourceDocuments(
  ctx: Ctx,
  events: BusinessEvent[],
): { documents: DocumentUploaded.Document[]; errors: Error[] } {
  const documents: DocumentUploaded.Document[] = [];
  const errors: EventSourcingError[] = [];
  const urls = new Map<string, string>();

  for (const event of events) {
    apply(ctx, documents, urls, event, errors);
  }

  for (const doc of documents) {
    const url = urls.get(doc.organization);

    if (url) {
      doc.organizationUrl = url;
    }
  }

  return { documents, errors };
}

function apply(
  ctx: Ctx,
  documents: DocumentUploaded.Document[],
  urls: Map<string, string>,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
  logger.trace({ event }, "Applying document event");
  if (event.type === "document_uploaded") {
    newDocumentFromEvent(ctx, documents, event, errors);
  } else if (event.type === "storage_service_url_published") {
    applyStorageServiceUrl(urls, event);
  }
}

function newDocumentFromEvent(
  ctx: Ctx,
  documents: DocumentUploaded.Document[],
  event: DocumentUploaded.Event,
  errors: EventSourcingError[],
) {
  const document: DocumentUploaded.Document = {
    id: event.docId,
    fileName: event.fileName,
    organization: event.organization,
    organizationUrl: "",
  };

  const result = DocumentUploaded.validateDocument(document);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event }, result));
    return;
  }

  documents.push(result);
}

export function sourceOffchainDocuments(
  ctx: Ctx,
  events: BusinessEvent[],
): { documents: UploadedDocument[]; errors: Error[] } {
  const documents: UploadedDocument[] = [];
  const errors: EventSourcingError[] = [];

  for (const event of events) {
    if (event.type === "workflowitem_document_uploaded") {
      newOffchainDocumentFromEvent(ctx, documents, event, errors);
    }
  }

  return { documents, errors };
}

function newOffchainDocumentFromEvent(
  ctx: Ctx,
  documents: UploadedDocument[],
  event: WorkflowitemDocumentUploaded.Event,
  errors: EventSourcingError[],
) {
  const document = WorkflowitemDocumentUploaded.createFrom(ctx, event);
  if (Result.isErr(document)) {
    errors.push(new EventSourcingError({ ctx, event }, document));
    return;
  }

  documents.push(document);
}

export function sourceSecrets(
  ctx: Ctx,
  events: BusinessEvent[],
): { secrets: DocumentShared.SecretPublished[]; errors: Error[] } {
  const secrets: DocumentShared.SecretPublished[] = [];
  const errors: EventSourcingError[] = [];

  for (const event of events) {
    logger.trace({ event }, "Creating new secret from event");

    if (event.type === "secret_published") {
      newSecretFromEvent(ctx, secrets, event, errors);
    }
  }

  return { secrets, errors };
}

function newSecretFromEvent(
  ctx: Ctx,
  secrets: DocumentShared.SecretPublished[],
  event: DocumentShared.Event,
  errors: EventSourcingError[],
) {
  const secret: DocumentShared.SecretPublished = {
    docId: event.docId,
    organization: event.organization,
    encryptedSecret: event.encryptedSecret,
  };

  const result = DocumentShared.validateSecret(secret);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event }, result));
    return;
  }

  secrets.push(result);
}
