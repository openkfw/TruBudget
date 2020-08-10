import * as crypto from "crypto";
import Joi = require("joi");
import uuid = require("uuid");
import * as Result from "../../../result";
import VError = require("verror");

export interface StoredDocument {
  // id per workflowitem (same id in different workflowitems allowed)
  id: string;
  hash: string;
  // unique id in general, used to find the right document stored offchain
  documentId: string;
}

export const storedDocumentSchema = Joi.object({
  id: Joi.string().required(),
  hash: Joi.string().required(),
  documentId: Joi.string(),
});

export interface UploadedDocument {
  id: string;
  base64: string;
  fileName: string;
}

export const uploadedDocumentSchema = Joi.object({
  id: Joi.string().required(),
  base64: Joi.string().required(),
  fileName: Joi.string(),
});

export async function hashDocument(
  document: UploadedDocument,
): Promise<Result.Type<StoredDocument>> {
  return hashBase64String(document.base64).then((hashValue) => ({
    id: document.id,
    hash: hashValue,
    documentId: uuid.v4(),
  }));
}

export async function hashDocuments(
  documents: UploadedDocument[],
): Promise<Result.Type<StoredDocument[]>> {
  const documentHashes: StoredDocument[] = [];
  for (const doc of documents || []) {
    const hashedDocumentResult = await hashDocument(doc);
    if (Result.isErr(hashedDocumentResult)) {
      return new VError(hashedDocumentResult, `failed to hash document ${doc.id}`);
    }
    documentHashes.push(hashedDocumentResult);
  }
  return documentHashes;
}

async function hashBase64String(base64String: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
}

export function validate(input: any): Result.Type<UploadedDocument> {
  const { error, value } = Joi.validate(input, uploadedDocumentSchema);
  return !error ? value : error;
}
