import Joi = require("joi");
import { ValidationResult } from "..";
import { globalIntents } from "../intents";



const eventType = "global_permission_revoked";


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  permission: Joi.valid(...globalIntents).required(),
  revokee: Joi.string().required(),
}).options({ stripUnknown: true });

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