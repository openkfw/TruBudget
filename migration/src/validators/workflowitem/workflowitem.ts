import Joi = require("joi");
import { ValidationResult } from "..";
import { moneyAmountSchema } from "../money";
import * as Subproject from "../subproject/subproject";


const documentReferenceSchema = Joi.object({
  id: Joi.string().required(),
  fileName: Joi.string().required(),
  hash: Joi.string().required(),
  available: Joi.boolean(),
});

const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();

const workflowitemTraceEventSchema = Joi.object({
  entityId: Joi.string().required(),
  entityType: Joi.valid("workflowitem").required(),
  businessEvent: businessEventSchema.required(),
  snapshot: Joi.object({
    displayName: Joi.string(),
    amount: Joi.string(),
    currency: Joi.string(),
    amountType: Joi.string(),
  }).required(),
});

const workflowitemTypes = ["general", "restricted"];
const workflowitemTypeSchema = Joi.string().valid(...workflowitemTypes);


const schema = Joi.object().keys({
  isRedacted: Joi.boolean().required(),
  id: Joi.string().required(),
  subprojectId: Subproject.idSchema.required(),
  createdAt: Joi.date().iso().required(),
  dueDate: Joi.date().iso().allow(""),
  displayName: Joi.string().required(),
  exchangeRate: Joi.string()
    .when("amountType", {
      is: Joi.valid("N/A"),
      then: Joi.forbidden(),
      break: true,
    })
    .when("status", {
      is: Joi.valid("closed"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  billingDate: Joi.date()
    .iso()
    .when("amountType", {
      is: Joi.valid("N/A"),
      then: Joi.forbidden(),
      break: true,
    })
    .when("status", {
      is: Joi.valid("closed"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  amount: moneyAmountSchema
    .when("amountType", {
      is: Joi.valid("N/A"),
      then: Joi.forbidden(),
      break: true,
    })
    .when("status", {
      is: Joi.valid("closed"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  currency: Joi.string()
    .when("amountType", {
      is: Joi.valid("N/A"),
      then: Joi.forbidden(),
      break: true,
    })
    .when("status", {
      is: Joi.valid("closed"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  amountType: Joi.string().valid("N/A", "disbursed", "allocated").required(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("open", "closed").required(),
  rejectReason: Joi.string().optional(),
  assignee: Joi.string(),
  documents: Joi.array().required().items(documentReferenceSchema),
  permissions: Joi.object().pattern(/.*/, Joi.array().items(Joi.string())).required(),
  log: Joi.array().required().items(workflowitemTraceEventSchema),
  additionalData: Joi.object().unknown().required(),
  workflowitemType: workflowitemTypeSchema,
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