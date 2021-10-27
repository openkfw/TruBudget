import { VError } from "verror";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { GenericDocument, UploadedDocument } from "./document";
import { sourceDocuments, sourceOffchainDocuments } from "./document_eventsourcing";
import * as DocumentUploaded from "./document_uploaded";
import logger from "lib/logger";

interface Repository {
  getDocumentsEvents(): Promise<Result.Type<BusinessEvent[]>>;
  getOffchainDocumentsEvents(): Promise<Result.Type<BusinessEvent[]>>;
}

export async function getAllDocuments(
  ctx: Ctx,
  repository: Repository,
): Promise<Result.Type<GenericDocument[]>> {
  logger.trace("Getting all documents from storage");
  const documentsFromStorage = await getAllDocumentInfos(ctx, repository);

  if (Result.isErr(documentsFromStorage)) {
    return new VError(documentsFromStorage, "get all documents from storage failed");
  }

  const offchainDocuments = await getAllDocumentsFromOffchainStorage(ctx, repository);
  if (Result.isErr(offchainDocuments)) {
    return new VError(offchainDocuments, "get all offchain documents failed");
  }

  return [...documentsFromStorage, ...offchainDocuments];
}

export async function getAllDocumentInfos(
  ctx: Ctx,
  repository: Repository,
): Promise<Result.Type<DocumentUploaded.Document[]>> {
  logger.trace("Getting all document infos");
  const documentEvents = await repository.getDocumentsEvents();

  if (Result.isErr(documentEvents)) {
    return new VError(documentEvents, "fetch storage documents events failed");
  }

  const { documents } = sourceDocuments(ctx, documentEvents);
  return documents;
}

export async function getDocumentInfo(
  ctx: Ctx,
  docId: string,
  repository: Repository,
): Promise<Result.Type<DocumentUploaded.Document | undefined>> {
  logger.trace({ docId }, "Getting infos of document by id");
  const documentInfos = await getAllDocumentInfos(ctx, repository);

  if (Result.isErr(documentInfos)) {
    return new VError(documentInfos, "get all documents from storage failed");
  }

  const document = documentInfos.find((doc) => doc.id === docId);
  return document;
}

export async function getAllDocumentsFromOffchainStorage(
  ctx: Ctx,
  repository: Repository,
): Promise<Result.Type<UploadedDocument[]>> {
  logger.trace("Getting all documents from offchain storage");
  const documentEvents = await repository.getOffchainDocumentsEvents();

  if (Result.isErr(documentEvents)) {
    return new VError(documentEvents, "fetch offchain_documents events failed");
  }

  const { documents } = sourceOffchainDocuments(ctx, documentEvents);
  return documents;
}

export async function getOffchainDocument(
  ctx: Ctx,
  docId: string,
  repository: Repository,
): Promise<Result.Type<UploadedDocument | undefined>> {
  logger.trace({ docId }, "Getting document from offchain storage by id");
  const offchainDocuments = await getAllDocumentsFromOffchainStorage(ctx, repository);

  if (Result.isErr(offchainDocuments)) {
    return new VError(offchainDocuments, "get all offchain documents failed");
  }

  const isErr = offchainDocuments.find((d) => Result.isErr(d));
  if (isErr) return new VError("get all offchain documents failed");

  const offchainDocument = offchainDocuments.find((doc) => doc.id === docId);
  return offchainDocument;
}
