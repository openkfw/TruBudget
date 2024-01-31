import Joi = require("joi");
import { ValidationResult } from "..";
import { allIntents } from "../intents";
import { currencyCodeSchema, moneyAmountSchema } from "../money";

export const idSchema = Joi.string().max(32);
export type Id = string;

const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);

export const tagsSchema = Joi.string()
  .regex(/^([A-Za-zÀ-ÿ0-9])*[A-Za-zÀ-ÿ0-9-_]+$/)
  .max(15);


export const projectedBudgetSchema = Joi.object({
  organization: Joi.string().required(),
  value: moneyAmountSchema.required(),
  currencyCode: currencyCodeSchema.required(),
});

const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();


const projectTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("project").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string().required(),
  }).required(),
});

export const projectedBudgetListSchema = Joi.array().items(projectedBudgetSchema);

const AdditionalDataSchema = Joi.object().unknown();


export const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date().iso().required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string(),
  thumbnail: Joi.string().allow(""),
  projectedBudgets: projectedBudgetListSchema.required(),
  permissions: permissionsSchema.required(),
  log: Joi.array().required().items(projectTraceEventSchema),
  additionalData: AdditionalDataSchema.required(),
  tags: Joi.array().items(tagsSchema).required().unique().default([]),
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

