import Joi = require("joi");

import { getAllowedIntents, hasIntersection } from "../authz";
import Intent from "../authz/intents";
import { Permissions } from "../authz/types";
import { User, userIdentities } from "./User";

export interface CreateProjectInput {
  displayName: string;
  description: string;
  amount: string;
  currency: string;
  id?: string;
  creationUnixTs?: string;
  status?: "open" | "closed";
  assignee?: string;
  thumbnail?: string;
}

export interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  amount: string;
  currency: string;
  thumbnail: string;
  permissions: Permissions;
  log: HistoryEvent[];
}

export interface ScrubbedProject {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  amount: string;
  currency: string;
  thumbnail: string;
  permissions: Permissions;
  log: ScrubbedHistoryEvent[];
}

export interface HistoryEvent {
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

const schema = Joi.object().keys({
  id: Joi.string()
    .max(32)
    .required(),
  // https://github.com/hapijs/joi/issues/1051
  creationUnixTs: Joi.string().required(),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
  displayName: Joi.string().required(),
  assignee: Joi.string(),
  description: Joi.string()
    .allow("")
    .required(),
  amount: Joi.string().required(),
  currency: Joi.string().required(),
  thumbnail: Joi.string()
    .allow("")
    .required(),
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
  log: Joi.array(),
});

export function validateProject(input: Project): Project {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value;
  } else {
    throw error;
  }
}

export function isProjectVisibleTo(project: Project, actingUser: User): boolean {
  const allowedIntents: Intent[] = ["project.viewSummary", "project.viewDetails"];
  const userIntents = getAllowedIntents(userIdentities(actingUser), project.permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}

export function isProjectCreateable(permissions: Permissions, actingUser: User): boolean {
  const allowedIntent: Intent = "global.createProject";
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function isProjectAssignable(project: Project, actingUser: User): boolean {
  const allowedIntent: Intent = "project.assign";
  const userIntents = getAllowedIntents(userIdentities(actingUser), project.permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function isProjectUpdateable(project: Project, actingUser: User): boolean {
  const allowedIntent: Intent = "project.update";
  const userIntents = getAllowedIntents(userIdentities(actingUser), project.permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  return hasPermission;
}

export function scrubHistory(project: Project, actingUser: User): ScrubbedProject {
  const userIntents = getAllowedIntents(userIdentities(actingUser), project.permissions);
  const log = project.log ? project.log.map(event => redactHistoryEvent(event, userIntents)) : [];
  const scrubbed = {
    ...project,
    log,
  };
  return scrubbed;
}

const requiredPermissions = new Map<Intent, Intent[]>([
  ["global.createProject", ["project.viewSummary", "project.viewDetails"]],
  ["project.intent.grantPermission", ["project.intent.listPermissions"]],
  ["project.intent.revokePermission", ["project.intent.listPermissions"]],
  ["project.assign", ["project.viewDetails"]],
  ["project.update", ["project.viewDetails"]],
  ["project.close", ["project.viewSummary", "project.viewDetails"]],
  ["project.archive", ["project.viewSummary", "project.viewDetails"]],
  ["project.createSubproject", ["project.viewDetails"]],
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
