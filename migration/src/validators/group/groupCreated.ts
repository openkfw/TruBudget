import Joi = require("joi");
import { ValidationResult } from "..";

import { allIntents } from "../intents";
import * as Group from "./group";


const eventType = "group_created";
const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);



const initialDataSchema = Joi.object({
  id: Group.idSchema.required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  members: Group.membersSchema.required(),
  permissions: permissionsSchema.required(),
  additionalData: Joi.object().unknown().required(),
}).options({ stripUnknown: true });


export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  group: initialDataSchema.required(),
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