import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as DocumentUploaded from "./document_uploaded";
import * as DocumentShared from "./document_shared";
import { applyStorageServiceUrls as applyStorageServiceUrl } from "./storage_service_url_eventsourcing";
import logger from "lib/logger";
import { StoredDocument } from "./document";

export function sourceDocuments(
  ctx: Ctx,
  events: BusinessEvent[],
): { documents: StoredDocument[]; errors: Error[] } {
  const documents: StoredDocument[] = [];
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
  documents: StoredDocument[],
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
  documents: StoredDocument[],
  event: DocumentUploaded.Event,
  errors: EventSourcingError[],
) {
  const document: StoredDocument = {
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
