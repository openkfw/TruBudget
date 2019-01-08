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

export function validateProject({
  id,
  creationUnixTs,
  status,
  displayName,
  assignee,
  description,
  amount,
  currency,
  thumbnail,
  permissions,
}: any): Project {
  if (!isNonemptyString(id)) {
    throw Error(`Not a valid project ID: ${JSON.stringify(id)}`);
  }

  if (!isNonemptyString(creationUnixTs) || ((creationUnixTs as any) as number) < 0) {
    throw Error(`Not a valid unix timestamp: ${JSON.stringify(creationUnixTs)}`);
  }

  if (!["open", "closed"].includes(status)) {
    throw Error(`Not a valid status: ${JSON.stringify(status)}`);
  }

  if (!isNonemptyString(displayName)) {
    throw Error(`Not a valid display name: ${JSON.stringify(displayName)}`);
  }

  if (assignee !== undefined && !isNonemptyString(assignee)) {
    throw Error(`Not a valid assignee: ${JSON.stringify(assignee)}`);
  }

  if (!isString(description)) {
    throw Error(`Not a valid description: ${JSON.stringify(description)}`);
  }

  if (!isNonemptyString(amount)) {
    throw Error(`Not a valid amount: ${JSON.stringify(amount)}`);
  }

  if (!isNonemptyString(currency)) {
    throw Error(`Not a valid currency: ${JSON.stringify(currency)}`);
  }

  if (!isString(thumbnail)) {
    throw Error(`Not a valid thumbnail: ${JSON.stringify(thumbnail)}`);
  }

  // TODO validate permissions object

  const project: Project = {
    id,
    creationUnixTs,
    status,
    displayName,
    assignee,
    description,
    amount,
    currency,
    thumbnail,
    permissions,
  };

  return project;
}

// tslint:disable-next-line:no-any
function isString(x: any): boolean {
  return typeof x === "string";
}

// tslint:disable-next-line:no-any
function isNonemptyString(x: any): boolean {
  return typeof x === "string" && x.length > 0;
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
