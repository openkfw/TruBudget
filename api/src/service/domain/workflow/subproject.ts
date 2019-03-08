import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
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
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: SubprojectTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
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
  projectedBudgets: projectedBudgetListSchema.required(),
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
  log: Joi.array()
    .required()
    .items(subprojectTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
});

export function validate(input: any): Result.Type<Subproject> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

export function permits(
  subproject: Subproject,
  actingUser: ServiceUser,
  intents: Intent[],
): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = subproject.permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);
  const hasPermission = eligibleIdentities.some(identity =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}
