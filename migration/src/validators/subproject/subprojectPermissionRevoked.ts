import Joi = require("joi");
import { ValidationResult } from "..";
import { subprojectIntents } from "../intents";
import * as Project from "../project/project";
import * as Subproject from "./subproject";

const eventType = "subproject_permission_revoked";


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  permission: Joi.valid(...subprojectIntents).required(),
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

