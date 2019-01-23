import Joi = require("joi");

import { getAllowedIntents, hasIntersection } from "../authz";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent } from "../authz/types";
import { User, userIdentities } from "./User";

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
  permissions: AllowedUserGroupsByIntent;
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
  permissions: AllowedUserGroupsByIntent;
  log: ScrubbedHistoryEvent[];
}

interface HistoryEvent {
  intent: Intent;
  snapshot: {
    displayName: string;
    permissions: object;
  };
}

type ScrubbedHistoryEvent = null | {
  intent: Intent;
  snapshot: {
    displayName: string;
    permissions?: object;
  };
};

const schema = Joi.object().keys({
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

export function isProjectAssignable(project: Project, actingUser: User): boolean {
  const allowedIntent: Intent = "project.assign";
  const userIntents = getAllowedIntents(userIdentities(actingUser), project.permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  // do we need to check whether the project is closed?
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
    id: project.id,
    creationUnixTs: project.creationUnixTs,
    status: project.status,
    displayName: project.displayName,
    assignee: project.assignee,
    description: project.description,
    amount: project.amount,
    currency: project.currency,
    thumbnail: project.thumbnail,
    permissions: project.permissions,
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
  ["project.close", ["project.viewDetails"]],
  ["project.archive", ["project.viewDetails"]],
  ["project.createSubproject", ["project.viewDetails", "subproject.viewDetails"]],
]);

function redactHistoryEvent(event: HistoryEvent, userIntents: Intent[]): ScrubbedHistoryEvent {
  const observedIntent = event.intent;
  if (requiredPermissions.has(observedIntent)) {
    const allowedIntents = requiredPermissions.get(observedIntent);
    const isAllowedToSee = hasIntersection(allowedIntents, userIntents);

    if (!isAllowedToSee) {
      // The user can't see the event..
      return null;
    }

    if (
      event.intent === "global.createProject" &&
      !userIntents.includes("project.intent.listPermissions")
    ) {
      // The user can see the event but not the associated project permissions:
      delete event.snapshot.permissions;
    }

    if (
      event.intent === "project.createSubproject" &&
      !userIntents.includes("subproject.intent.listPermissions")
    ) {
      // The user can see the event but not the associated subproject permissions:
      delete event.snapshot.permissions;
    }

    return event;
  } else if (userIntents.includes(observedIntent)) {
    // If not explicitly stated otherwise, always allow to see events related to
    // something the user is already entitled for
    return event;
  } else {
    // Redacted by default:
    return null;
  }
}
