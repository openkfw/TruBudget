import Joi = require("joi");
import { ValidationResult } from "..";
import { conversionRateSchema, moneyAmountSchema } from "../money";
import * as Project from "./../project/project";
import * as Subproject from "./../subproject/subproject";

const eventType = "workflowitem_updated";
const idSchema = Joi.string().max(32);

const documentReferenceSchema = Joi.object({
  id: Joi.string().required(),
  fileName: Joi.string().required(),
  hash: Joi.string().required(),
  available: Joi.boolean(),
});


export const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  exchangeRate: conversionRateSchema,
  billingDate: Joi.date().iso(),
  amount: moneyAmountSchema,
  currency: Joi.string(),
  amountType: Joi.valid("N/A", "disbursed", "allocated"),
  dueDate: Joi.date().iso().allow(""),
  documents: Joi.array().items(documentReferenceSchema),
  additionalData: Joi.object().unknown(),
});

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: idSchema.required(),
  update: modificationSchema.required(),
});

export function validate(input): ValidationResult {
  const { error } = schema.validate(input);
  if (error === undefined)
    return {
      isError: false,
      data: input
    }
  return {
    isError: true,
    data: error
  }
}