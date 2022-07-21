import Joi = require("joi");

import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import { Permissions, permissionsSchema } from "../permissions";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import { ProjectTraceEvent, projectTraceEventSchema } from "./project_trace_event";

export type Id = string;

export const idSchema = Joi.string().max(32);
export const tagsSchema = Joi.string()
  .regex(/^([A-Za-zÀ-ÿ0-9])*[A-Za-zÀ-ÿ0-9-_]+$/)
  .max(15);

export interface Project {
  id: Id;
  createdAt: string; // ISO timestamp
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee: string;
  thumbnail?: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: ProjectTraceEvent[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
  tags: string[];
}

const schema = Joi.object({
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
  additionalData: AdditionalData.schema.required(),
  tags: Joi.array().items(tagsSchema).required().unique().default([]),
});

export function validate(input): Result.Type<Project> {
  const { error } = schema.validate(input);
  return error === undefined ? (input as Project) : error;
}

export function permits(project: Project, actingUser: ServiceUser, intents: Intent[]): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = project.permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);
  const hasPermission = eligibleIdentities.some((identity) =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}
