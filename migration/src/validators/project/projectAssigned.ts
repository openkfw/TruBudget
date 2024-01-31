import Joi from "joi";
import { ValidationResult } from "..";

import * as Project from "./project";

type EventTypeType = "project_assigned";
const eventType: EventTypeType = "project_assigned";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: string;//Identity;
  projectId: Project.Id;
  assignee: string;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  assignee: Joi.string().required(),
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
