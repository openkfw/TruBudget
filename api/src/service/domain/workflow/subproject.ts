import Joi = require("joi");

import * as Result from "../../../result";
import { Permissions } from "../permissions";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import { SubprojectTraceEvent, subprojectTraceEventSchema } from "./subproject_trace_event";

export type Id = string;

export const idSchema = Joi.string().max(32);

export interface Subproject {
  id: Id;
  createdAt: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee?: string;
  currency: string;
  closingDate?: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: SubprojectTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: {};
}

const schema = Joi.object({
  id: idSchema.required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
  displayName: Joi.string().required(),
  description: Joi.string()
    .allow("")
    .required(),
  assignee: Joi.string(),
  currency: Joi.string().required(),
  closingDate: Joi.string().when("status", { is: Joi.valid("closed"), then: Joi.required() }),
  projectedBudgets: projectedBudgetListSchema.required(),
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
  log: Joi.array()
    .required()
    .items(subprojectTraceEventSchema),
  additionalData: Joi.object(),
});

export function validate(input: any): Result.Type<Subproject> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
