import Joi = require("joi");
import { ValidationResult } from "..";
import * as Project from "./../project/project";
import * as Subproject from "./../subproject/subproject";


const eventType = "workflowitem_closed";
const idSchema = Joi.string().max(32);


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: idSchema.required(),
  rejectReason: Joi.string().optional(),
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
