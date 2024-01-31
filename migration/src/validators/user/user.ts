import Joi = require("joi");

import { ValidationResult } from "..";

import { allIntents } from "../intents";

export type Id = string;
export const idSchema = Joi.string().max(32);
export const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);
const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();


export const userTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("user").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});


const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date().iso().required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordHash: Joi.string().required(),
  address: Joi.string().required(),
  encryptedPrivKey: Joi.string().required(),
  permissions: permissionsSchema.required(),
  log: Joi.array().required().items(userTraceEventSchema),
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

