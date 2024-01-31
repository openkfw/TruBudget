import Joi = require("joi");

import { ValidationResult } from "..";
import { allIntents } from "../intents";


export const idSchema = Joi.string();
export const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();

export const memberSchema = Joi.string();
export const membersSchema = Joi.array().items(memberSchema);

export const groupTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("group").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});


const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);


const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date().iso().required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  members: membersSchema.required(),
  permissions: permissionsSchema.required(),
  log: Joi.array().required().items(groupTraceEventSchema),
  additionalData: Joi.object().unknown().required(),
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