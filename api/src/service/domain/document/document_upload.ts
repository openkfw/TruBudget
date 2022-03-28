import { VError } from "verror";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { GenericDocument } from "./document";
import * as DocumentShared from "./document_shared";
import * as DocumentUploaded from "./document_uploaded";
import * as UserRecord from "../organization/user_record";
import { PreconditionError } from "../errors/precondition_error";
import logger from "lib/logger";

export interface RequestData {
  id: string;
  fileName: string;
  documentBase64: string;
}

type Base64String = string;
type HashedBase64String = string;

interface DocumentStorageServiceResponse {
  id: string;
  secret: string;
}

interface Repository {
  getAllDocumentReferences(): Promise<Result.Type<GenericDocument[]>>;
  storeDocument(id, name, hash): Promise<Result.Type<DocumentStorageServiceResponse>>;
  encryptWithKey(secret, publicKey): Promise<Result.Type<string>>;
  getPublicKey(organization): Promise<Result.Type<Base64String>>;
  getUser(userId: string): Promise<Result.Type<UserRecord.UserRecord>>;
}

function docIdAlreadyExists(existingDocuments: GenericDocument[], docId: string) {
  return existingDocuments.some((doc) => doc.id === docId);
}

export async function uploadDocument(
  ctx: Ctx,
  issuer: ServiceUser,
  requestData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const { id, documentBase64, fileName } = requestData;

  logger.trace("Getting all documents from repository");
  const existingDocuments = await repository.getAllDocumentReferences();
  if (Result.isErr(existingDocuments)) {
    return new VError(existingDocuments, "cannot get documents");
  }

  logger.trace({ docId: id }, "Checking if document with id already exists");
  if (docIdAlreadyExists(existingDocuments, id)) {
    return new VError(id, "failed to upload document, a document with this id already exists");
  }

  if (documentBase64 === "") {
    return new VError(documentBase64, "an empty document is not allowed");
  }

  logger.trace("Storing document in storage");
  const documentStorageServiceResponseResult = await repository.storeDocument(
    id,
    fileName,
    documentBase64,
  );

  if (Result.isErr(documentStorageServiceResponseResult)) {
    return new VError(documentStorageServiceResponseResult, "failed to store document");
  }

  const { secret } = documentStorageServiceResponseResult;
  if (!secret || Result.isErr(secret)) {
    return new VError("Failed to get the secret for this document");
  }

  logger.trace({ issuer }, "Getting organization of issuer");
  const userResult = await repository.getUser(issuer.id);
  if (Result.isErr(userResult)) {
    return new VError(issuer.id, "Error getting user");
  }

  const user = userResult;
  const organization = user.organization;
  const publicKeyBase64 = await repository.getPublicKey(organization);

  if (Result.isErr(publicKeyBase64)) {
    return new VError(publicKeyBase64, "failed to get public key");
  }

  const publicBuff = Buffer.from(publicKeyBase64, "base64");
  const publicKey = publicBuff.toString("utf8");
  const encryptedSecret = await repository.encryptWithKey(secret, publicKey);

  if (Result.isErr(encryptedSecret)) {
    return new VError(encryptedSecret, "failed to encrypt secret");
  }

  const newDocumentUploadedEvent = DocumentUploaded.createEvent(
    ctx.source,
    issuer.id,
    id,
    fileName || "untitled",
    organization,
  );
  if (Result.isErr(newDocumentUploadedEvent)) {
    return new VError(newDocumentUploadedEvent, "cannot update workflowitem");
  }

  logger.trace("Creating document_shared event with secret");
  const newSecretPublishedEvent = DocumentShared.createEvent(
    ctx.source,
    issuer.id,
    id,
    organization,
    encryptedSecret,
  );
  if (Result.isErr(newSecretPublishedEvent)) {
    return new VError(newSecretPublishedEvent, "cannot publish document secret");
  }

  if (issuer.id === "root") {
    return new PreconditionError(
      ctx,
      newDocumentUploadedEvent,
      "user 'root' is not allowed to upload documents",
    );
  }

  return [newDocumentUploadedEvent, newSecretPublishedEvent];
}
