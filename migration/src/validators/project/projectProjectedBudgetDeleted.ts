import Joi = require("joi");
import { ValidationResult } from "..";
import { currencyCodeSchema } from "../money";
import * as Project from "./project";

type EventTypeType = "project_projected_budget_deleted";
const eventType: EventTypeType = "project_projected_budget_deleted";


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
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

