import Joi = require("joi");

import { ValidationResult } from "..";
import * as Project from "../project/project";
import { projectedBudgetListSchema } from "../project/project";
import * as Subproject from "./subproject";

const eventType = "subproject_updated";
const AdditionalDataSchema = Joi.object().unknown();

export const updatedDataSchema = Joi.object({
  status: Joi.string().valid("open", "closed"),
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  assignee: Joi.string(),
  currency: Joi.string(),
  projectedBudgets: projectedBudgetListSchema,
  additionalData: AdditionalDataSchema,
});

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  update: updatedDataSchema.required(),
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