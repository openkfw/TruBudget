import Joi = require("joi");
import { ValidationResult } from "..";
import { allIntents } from "../intents";
import * as Project from "./project";

type EventTypeType = "project_created";
const eventType: EventTypeType = "project_created";

export const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);


const initialDataSchema = Joi.object({
  id: Project.idSchema.required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string(),
  thumbnail: Joi.string().allow(""),
  projectedBudgets: Project.projectedBudgetListSchema.required(),
  permissions: permissionsSchema.required(),
  additionalData: Joi.object().unknown().required(),
  tags: Joi.array().items(Project.tagsSchema),
}).options({ stripUnknown: true });


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  project: initialDataSchema.required(),
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

