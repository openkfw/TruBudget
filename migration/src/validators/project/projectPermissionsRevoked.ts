import Joi = require("joi");
import { ValidationResult } from "..";
import { projectIntents } from "../intents";
import * as Project from "./project";

type EventTypeType = "project_permission_revoked";
const eventType: EventTypeType = "project_permission_revoked";



export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  permission: Joi.valid(...projectIntents).required(),
  revokee: Joi.string().required(),
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

