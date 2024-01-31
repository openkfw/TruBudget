import Joi = require("joi");
import { ValidationResult } from "..";
import { currencyCodeSchema } from "../money";
import * as Project from "../project/project";
import * as Subproject from "./subproject";

const eventType = "subproject_projected_budget_deleted";

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  organization: Joi.string().required(),
  currencyCode: currencyCodeSchema.required(),
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
