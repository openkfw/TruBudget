import Joi = require("joi");
import { ValidationResult } from "..";
import { userIntents } from "../intents";
import * as UserRecord from "./user";

const eventType = "user_permission_revoked";


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  userId: UserRecord.idSchema.required(),
  permission: Joi.valid(...userIntents).required(),
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
