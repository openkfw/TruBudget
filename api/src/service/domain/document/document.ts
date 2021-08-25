import * as crypto from "crypto";
import Joi = require("joi");
import uuid = require("uuid");
import * as Result from "../../../result";
import VError = require("verror");

export interface StoredDocument {
  id: string;
  hash: string;
  // new document feature properties
  fileName?: string;
  available?: boolean;
  organization?: string;
  organizationUrl?: string;
}

export const storedDocumentSchema = Joi.object({
  id: Joi.string().required(),
  hash: Joi.string().allow("").required(),
  fileName: Joi.string(),
  available: Joi.boolean(),
  organization: Joi.string(),
  organizationUrl: Joi.string(),
});

export interface DocumentInfo extends GenericDocument {
  id: string;
  fileName: string;
  organization: string;
  organizationUrl: string;
}

export interface GenericDocument {
  id: string;
}

export interface UploadedDocument extends GenericDocument {
  id: string;
  base64: string;
  fileName: string;
}

export const uploadedDocumentSchema = Joi.object({
  id: Joi.string(),
  base64: Joi.string()
    .required()
    .max(67000000)
    .error(() => new Error("Document is not valid")),
  fileName: Joi.string(),
});

export async function hashDocument(
  document: UploadedDocument,
): Promise<Result.Type<StoredDocument>> {
  return hashBase64String(document.base64).then((hashValue) => ({
    id: document.id,
    hash: hashValue,
    fileName: document.fileName,
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
