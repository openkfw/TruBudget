import Joi = require("joi");
import { ValidationResult } from "..";
import { allIntents } from "../intents";
import * as UserRecord from "./user";


const eventType = "user_created";

export const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);


const initialDataSchema = Joi.object({
  id: UserRecord.idSchema.required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordHash: Joi.string().required(),
  address: Joi.string().required(),
  encryptedPrivKey: Joi.string().required(),
  permissions: permissionsSchema.required(),
  additionalData: Joi.object().unknown().required(),
}).options({ stripUnknown: true });



export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  user: initialDataSchema.required(),
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