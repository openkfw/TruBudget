import Joi = require("joi");
import { ValidationResult } from "..";
import { currencyCodeSchema } from "../money";
import * as Project from "../project/project";


export const idSchema = Joi.string().max(32);

const workflowitemTypes = ["general", "restricted"];
const workflowitemTypeSchema = Joi.string().valid(...workflowitemTypes);

const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();

const subprojectTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("subproject").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string(),
  }).required(),
});


const schema = Joi.object({
  id: idSchema.required(),
  projectId: Project.idSchema.required(),
  createdAt: Joi.date().iso().required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string().required(),
  validator: Joi.string(),
  workflowitemType: workflowitemTypeSchema,
  currency: currencyCodeSchema.required(),
  projectedBudgets: Project.projectedBudgetListSchema.required(),
  workflowitemOrdering: Joi.array().items(Joi.string()).required(),
  permissions: Joi.object().pattern(/.*/, Joi.array().items(Joi.string())).required(),
  log: Joi.array().required().items(subprojectTraceEventSchema),
  additionalData: Joi.object().unknown().required(),
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