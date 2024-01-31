import Joi = require("joi");
import { ValidationResult } from "..";


const eventType = "node_declined";


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  address: Joi.string().required(),
  organization: Joi.string().required(),
  declinerAddress: Joi.string().required(),
  declinerOrganization: Joi.string().required(),
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