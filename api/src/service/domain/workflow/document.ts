import Joi = require("joi");

export interface StoredDocument {
  id: string;
  hash: string;
}

export const storedDocumentSchema = Joi.object({
  id: Joi.string().required(),
  hash: Joi.string().required(),
});

export type UploadedDocument = {
  id: string;
  base64: string;
};

export const uploadedDocumentSchema = Joi.object({
  id: Joi.string().required(),
  base64: Joi.string().required(),
});
