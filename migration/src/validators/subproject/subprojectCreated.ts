import Joi = require("joi");
import { ValidationResult } from "..";

import { currencyCodeSchema } from "../money";
import * as Project from "../project/project";
import { permissionsSchema } from "../project/projectCreated";
import * as Subproject from "./subproject";


const eventType = "subproject_created";
const AdditionalDataSchema = Joi.object().unknown();
const workflowitemTypes = ["general", "restricted"];
const workflowitemTypeSchema = Joi.string().valid(...workflowitemTypes);


const initialDataSchema = Joi.object({
  id: Subproject.idSchema.required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string().required(),
  validator: Joi.string(),
  workflowitemType: workflowitemTypeSchema,
  currency: currencyCodeSchema.required(),
  projectedBudgets: Project.projectedBudgetListSchema.required(),
  permissions: permissionsSchema.required(),
  additionalData: AdditionalDataSchema.required(),
}).options({ stripUnknown: true });



export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subproject: initialDataSchema.required(),
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


