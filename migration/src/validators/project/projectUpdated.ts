import Joi = require("joi");
import { ValidationResult } from "..";
import * as Project from "./project";

type EventTypeType = "project_updated";
const eventType: EventTypeType = "project_updated";

export const additionalData = Joi.object().unknown();


export const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  thumbnail: Joi.string().allow(""),
  additionalData: additionalData,
  tags: Joi.array().items(Project.tagsSchema),
}).or("displayName", "description", "thumbnail", "additionalData", "tags");



export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
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
