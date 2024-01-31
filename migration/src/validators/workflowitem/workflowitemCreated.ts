import Joi = require("joi");
import { ValidationResult } from "..";
import { allIntents } from "../intents";
import * as Project from "./../project/project";
import * as Subproject from "./../subproject/subproject";


const eventType = "workflowitem_created";
const idSchema = Joi.string().max(32);

const workflowitemTypes = ["general", "restricted"];
const workflowitemTypeSchema = Joi.string().valid(...workflowitemTypes);
const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);

const documentReferenceSchema = Joi.object({
  id: Joi.string().required(),
  fileName: Joi.string().required(),
  hash: Joi.string().required(),
  available: Joi.boolean(),
});

const initialDataSchema = Joi.object({
  id: idSchema.required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string(),
  amount: Joi.string(),
  currency: Joi.string(),
  amountType: Joi.valid("N/A", "disbursed", "allocated").required(),
  exchangeRate: Joi.string(),
  billingDate: Joi.date().iso(),
  dueDate: Joi.date().iso().allow(""),
  documents: Joi.array().items(documentReferenceSchema).required(),
  permissions: permissionsSchema.required(),
  additionalData: Joi.object().unknown().required(),
  workflowitemType: workflowitemTypeSchema,
}).options({ stripUnknown: true });


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitem: initialDataSchema.required(),
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