import Joi = require("joi");
import { ValidationResult } from "..";


const secretPublishedEventType = "secret_published";




export const schema = Joi.object({
  type: Joi.valid(secretPublishedEventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  docId: Joi.string().required(),
  organization: Joi.string().required(),
  encryptedSecret: Joi.string().required(),
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

