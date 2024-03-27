import Joi = require("joi");
import { ValidationResult } from "..";
import * as UserRecord from "./user";

type EventTypeType = "user_enabled";
const eventType: EventTypeType = "user_enabled";



const initialDataSchema = Joi.object({
  id: UserRecord.idSchema.required(),
});



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