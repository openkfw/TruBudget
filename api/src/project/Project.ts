import Joi = require("joi");

import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
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
}

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
});

export function validateProject(input: any): Project {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value as Project;
  } else {
    throw error;
  }
}

export function grantProjectPermission(project: Project, identity: string, intent: Intent) {
  const permissionsForIntent: People = project.permissions[intent] || [];
  if (!permissionsForIntent.includes(identity)) {
    permissionsForIntent.push(identity);
  }
  project.permissions[intent] = permissionsForIntent;
}

export function revokeProjectPermission(project: Project, identity: string, intent: Intent) {
  const permissionsForIntent: People = project.permissions[intent] || [];
  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex !== -1) {
    // Remove the user from the array:
    permissionsForIntent.splice(userIndex, 1);
    project.permissions[intent] = permissionsForIntent;
  }
}

export function isProjectVisibleTo(project: Project, user: User): boolean {
  const allowedIntents: Intent[] = ["project.viewSummary", "project.viewDetails"];
  const userIntents = getAllowedIntents(userIdentities(user), project.permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}

export function isProjectAssignable(project: Project, assigner: User, _assignee: string): boolean {
  const allowedIntent: Intent = "project.assign";
  const userIntents = getAllowedIntents(userIdentities(assigner), project.permissions);
  const hasPermission = userIntents.includes(allowedIntent);
  // do we need to check whether the project is closed?
  return hasPermission;
}
