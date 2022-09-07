import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import { Permissions } from "../permissions";
import WorkflowitemType, { workflowitemTypeSchema } from "../workflowitem_types/types";
import { CurrencyCode, currencyCodeSchema } from "./money";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import { SubprojectTraceEvent, subprojectTraceEventSchema } from "./subproject_trace_event";

export type Id = string;

export const idSchema = Joi.string().max(32);

export interface Subproject {
  id: Id;
  projectId: Project.Id;
  createdAt: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee: string;
  validator?: string;
  workflowitemType?: WorkflowitemType;
  currency: CurrencyCode;
  projectedBudgets: ProjectedBudget[];
  // The ordering doesn't need to include all workflowitems; any items not included here
  // are simply ordered by their creation time:
  workflowitemOrdering: string[];
  permissions: Permissions;
  log: SubprojectTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
}

const schema = Joi.object({
  id: idSchema.required(),
  projectId: Project.idSchema.required(),
  createdAt: Joi.date().iso().required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string().required(),
  validator: Joi.string(),
  workflowitemType: workflowitemTypeSchema,
  currency: currencyCodeSchema.required(),
  projectedBudgets: projectedBudgetListSchema.required(),
  workflowitemOrdering: Joi.array().items(Joi.string()).required(),
  permissions: Joi.object().pattern(/.*/, Joi.array().items(Joi.string())).required(),
  log: Joi.array().required().items(subprojectTraceEventSchema),
  additionalData: AdditionalData.schema.required(),
});

export function validate(input): Result.Type<Subproject> {
  const { error } = schema.validate(input);
  return error === undefined ? (input as Subproject) : error;
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
  const hasPermission = eligibleIdentities.some((identity) =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}
