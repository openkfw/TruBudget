import Joi = require("joi");

import { getAllowedIntents, hasIntersection } from "../authz";
import Intent from "../authz/intents";
import { Permissions } from "../authz/types";
import * as AdditionalData from "../service/domain/additional_data";
import { User, userIdentities } from "./User";

interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

export interface Subproject {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee?: string;
  currency: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: HistoryEvent[];
  additionalData: object;
}

export interface ScrubbedSubproject {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee?: string;
  currency: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: ScrubbedHistoryEvent[];
  additionalData: object;
}

interface HistoryEvent {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
  snapshot: {
    displayName: string;
  };
}

type ScrubbedHistoryEvent = null | HistoryEvent;

const schema = Joi.object({
  id: Joi.string()
    .max(32)
    .required(),
  creationUnixTs: Joi.date()
    .timestamp("unix")
    .required(),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
  displayName: Joi.string().required(),
  description: Joi.string()
    .allow("")
    .required(),
  currency: Joi.string().required(),
  projectedBudgets: Joi.array().items(
    Joi.object().keys({
      organization: Joi.string(),
      value: Joi.string(),
      currencyCode: Joi.string(),
    }),
  ),
  assignee: Joi.string(),
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
  log: Joi.array().required(),
  additionalData: AdditionalData.schema.required(),
});

export function validateSubproject(input: Subproject): Subproject {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value;
  } else {
    throw error;
  }
}

export function isSubprojectVisibleTo(subproject: Subproject, actingUser: User): boolean {
  const allowedIntents: Intent[] = ["subproject.viewSummary", "subproject.viewDetails"];
  const userIntents = getAllowedIntents(userIdentities(actingUser), subproject.permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}

export function isSubprojectAssignable(subproject: Subproject, actingUser: User): boolean {
  const allowedIntent: Intent = "subproject.assign";
  const userIntents = getAllowedIntents(userIdentities(actingUser), subproject.permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function isSubprojectUpdateable(subproject: Subproject, actingUser: User): boolean {
  const allowedIntent: Intent = "subproject.update";
  const userIntents = getAllowedIntents(userIdentities(actingUser), subproject.permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function scrubHistory(subproject: Subproject, actingUser: User): ScrubbedSubproject {
  const userIntents = getAllowedIntents(userIdentities(actingUser), subproject.permissions);
  const log = subproject.log.map(event => redactHistoryEvent(event, userIntents));
  const scrubbed = {
    id: subproject.id,
    creationUnixTs: subproject.creationUnixTs,
    status: subproject.status,
    displayName: subproject.displayName,
    description: subproject.description,
    currency: subproject.currency,
    projectedBudgets: subproject.projectedBudgets,
    assignee: subproject.assignee,
    permissions: subproject.permissions,
    additionalData: subproject.additionalData,
    log,
  };
  return scrubbed;
}

const requiredPermissions = new Map<Intent, Intent[]>([
  ["project.createSubproject", ["subproject.viewSummary", "subproject.viewDetails"]],
  ["subproject.intent.grantPermission", ["subproject.intent.listPermissions"]],
  ["subproject.intent.revokePermission", ["subproject.intent.listPermissions"]],
  ["subproject.assign", ["subproject.viewDetails"]],
  ["subproject.update", ["subproject.viewDetails"]],
  ["subproject.close", ["subproject.viewSummary", "subproject.viewDetails"]],
  ["subproject.archive", ["subproject.viewSummary", "subproject.viewDetails"]],
  ["subproject.createWorkflowitem", ["subproject.viewDetails", "workflowitem.view"]],
  ["subproject.reorderWorkflowitems", ["subproject.viewDetails", "workflowitem.view"]],
]);

function redactHistoryEvent(event: HistoryEvent, userIntents: Intent[]): ScrubbedHistoryEvent {
  const observedIntent = event.intent;
  if (!requiredPermissions.has(observedIntent)) {
    // Redacted by default:
    return null;
  }

  const allowedIntents = requiredPermissions.get(observedIntent);
  const isAllowedToSee = hasIntersection(allowedIntents, userIntents);

  return isAllowedToSee ? event : null;
}
