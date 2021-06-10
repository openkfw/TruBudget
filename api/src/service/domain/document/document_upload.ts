import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as DocumentUploaded from "./document_uploaded";
import * as DocumentShared from "./document_shared";
import * as Crypto from "crypto";
import { config } from "../../../config";
import { GenericDocument } from "./document";

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
  getAllDocuments(): Promise<Result.Type<GenericDocument[]>>;
  storeDocument(id, hash): Promise<Result.Type<DocumentStorageServiceResponse>>;
  encryptWithKey(secret, publicKey): Promise<Result.Type<string>>;
  getPublicKey(organization): Promise<Result.Type<Base64String>>;
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

  // const id = "9d14c5c6-7a0c-4acf-a856-7f7691e3799d";
  const existingDocuments = await repository.getAllDocuments();
  if (Result.isErr(existingDocuments)) {
    return new VError(existingDocuments, "cannot get documents");
  }

  if (docIdAlreadyExists(existingDocuments, id)) {
    return new VError(id, "failed to upload document, a document with this id already exists");
  }
  // store base64 of document in external storage
  const documentStorageServiceResponseResult = await repository.storeDocument(id, documentBase64);
  if (Result.isErr(documentStorageServiceResponseResult)) {
    return new VError(documentStorageServiceResponseResult, "failed to store document");
  }
  const { secret } = documentStorageServiceResponseResult;
  const organization = config.organization;
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

  // create doc Event: "offchain_documents" stream - create document_upload event (docId, filename, orga)
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
  // create secrets events: Check orga access -> check orga public keys (own public key included) -> encrypt secrets with key and generate event per orga on document_secrets stream (docId, orga, encrypted secret)
  // create secret event
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
  return [newDocumentUploadedEvent, newSecretPublishedEvent];
}
