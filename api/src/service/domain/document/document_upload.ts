import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as DocumentUploaded from "./document_uploaded";
import * as DocumentShared from "./document_shared";
import uuid = require("uuid");
import * as Crypto from "crypto";
import { config } from "../../../config";

export interface RequestData {
  docId?: string;
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
  getAllDocumentInfos(): Promise<Result.Type<DocumentUploaded.Document[]>>;
  storeDocument(id, hash): Promise<Result.Type<DocumentStorageServiceResponse>>;
  encryptWithKey(secret, publicKey): Promise<Result.Type<string>>;
  getPublicKey(organization): Promise<Result.Type<Base64String>>;
}

async function hashBase64String(
  base64String: Base64String,
): Promise<Result.Type<HashedBase64String>> {
  return new Promise<string>((resolve) => {
    const hash = Crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
}

function docIdAlreadyExists(allDocuments: DocumentUploaded.Document[], docId: string) {
  return allDocuments.some((doc) => doc.id === docId);
}
function useProvidedDocId(
  allDocuments: DocumentUploaded.Document[],
  providedDocId: string,
): Result.Type<string> {
  if (!docIdAlreadyExists(allDocuments, providedDocId)) {
    return providedDocId;
  } else {
    return Error(`document id ${providedDocId} already exists`);
  }
}
function generateUniqueDocId(allDocuments: DocumentUploaded.Document[]): string {
  // Generate a new document id
  while (true) {
    const docId = uuid.v4();
    if (!docIdAlreadyExists(allDocuments, docId)) {
      return docId;
    }
  }
}

export async function uploadDocument(
  ctx: Ctx,
  issuer: ServiceUser,
  requestData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const { documentBase64, fileName } = requestData;

  // check and generate a unique docId
  const documentInfosResult = await repository.getAllDocumentInfos();
  if (Result.isErr(documentInfosResult)) {
    return new VError(documentInfosResult, "cannot get documents");
  }

  let uniqueDocId: string;
  if (requestData.docId) {
    const uniqueDocIdResult = useProvidedDocId(documentInfosResult, requestData.docId);
    if (Result.isErr(uniqueDocIdResult)) {
      return new VError(uniqueDocIdResult, "cannot use provided document id");
    }
    uniqueDocId = uniqueDocIdResult;
  } else {
    uniqueDocId = generateUniqueDocId(documentInfosResult);
  }

  // store base64 of document in external storage
  const documentStorageServiceResponseResult = await repository.storeDocument(
    uniqueDocId,
    documentBase64,
  );
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
    uniqueDocId,
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
    uniqueDocId,
    organization,
    encryptedSecret,
  );
  if (Result.isErr(newSecretPublishedEvent)) {
    return new VError(newSecretPublishedEvent, "cannot publish document secret");
  }
  return [newDocumentUploadedEvent, newSecretPublishedEvent];
}
