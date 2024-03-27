import Joi = require("joi");
import { ValidationResult } from "..";
import * as Project from "./project";

type EventTypeType = "project_closed";
const eventType: EventTypeType = "project_closed";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: string//Identity;
  projectId: Project.Id;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
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