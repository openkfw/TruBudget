import * as crypto from "crypto";
import logger from "lib/logger";
import * as Result from "../../../result";
import Joi = require("joi");
import VError = require("verror");

export interface StoredDocument {
  id: string;
  fileName: string;
  organization: string;
  organizationUrl: string;
}

export interface DeletedDocument {
  id: string;
}

export const storedDocumentSchema = Joi.object({
  id: Joi.string().required(),
  fileName: Joi.string().required(),
  organization: Joi.string().required(),
  organizationUrl: Joi.string().required(),
});

export interface DocumentReference {
  id: string;
  fileName: string;
  hash: string;
  available?: boolean;
}

export interface DeleteDocumentResponse {
  status: number;
}

export interface ExternalLinkReference {
  id: string;
  fileName: string;
  link: string;
  available?: boolean;
}

export type DocumentOrExternalLinkReference = DocumentReference | ExternalLinkReference;

export const documentReferenceSchema = Joi.alternatives([
  Joi.object({
    id: Joi.string().required(),
    fileName: Joi.string().required(),
    hash: Joi.string().required(),
    available: Joi.boolean(),
  }),
  Joi.object({
    id: Joi.string().required(),
    fileName: Joi.string().required(),
    link: Joi.string().required(),
    available: Joi.boolean(),
  }),
]);

export interface UploadedDocument extends GenericDocument {
  id: string;
  base64: string;
  fileName: string;
}

export interface DocumentLink extends GenericDocument {
  id: string;
  link: string;
  fileName: string;
}

export type UploadedDocumentOrLink = UploadedDocument | DocumentLink;

export const uploadedDocumentSchema = Joi.alternatives([
  Joi.object({
    id: Joi.string(),
    base64: Joi.string()
      .required()
      .max(67000000)
      .error(() => new Error("Document is not valid")),
    fileName: Joi.string(),
  }),
  Joi.object({
    id: Joi.string(),
    link: Joi.string()
      .uri()
      .required()
      .error(() => new Error("Link is not valid")),
    fileName: Joi.string(),
  }),
]);

export interface GenericDocument {
  id: string;
}

export async function hashDocument(
  document: UploadedDocument,
): Promise<Result.Type<DocumentReference>> {
  logger.trace({ document: document.fileName }, "Hashing document");
  return hashBase64String(document.base64).then((hashValue) => ({
    id: document.id,
    hash: hashValue,
    fileName: document.fileName,
  }));
}

export async function hashDocuments(
  documents: UploadedDocument[],
): Promise<Result.Type<DocumentReference[]>> {
  const documentReference: DocumentReference[] = [];
  for (const doc of documents || []) {
    // uploaded document
    if ("base64" in doc) {
      const hashedDocumentResult = await hashDocument(doc);
      if (Result.isErr(hashedDocumentResult)) {
        return new VError(hashedDocumentResult, `failed to hash document ${doc.id}`);
      }
      documentReference.push(hashedDocumentResult);

      // external link, no need to hash
    } else {
      documentReference.push(doc);
    }
  }
  return documentReference;
}

export async function hashBase64String(base64String: string): Promise<string> {
  return new Promise<string>((resolve) => {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(base64String, "base64"));
    resolve(hash.digest("hex"));
  });
}

export function validate(input): Result.Type<UploadedDocument> {
  const { error, value } = uploadedDocumentSchema.validate(input);
  return !error ? value : error;
}
