import Joi = require("joi");
import { VError } from "verror";

import Intent, { projectIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";

type eventTypeType = "project_permission_granted";
const eventType: eventTypeType = "project_permission_granted";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  permission: Intent;
  grantee: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  permission: Joi.valid(projectIntents).required(),
  grantee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  permission: Intent,
  grantee: Identity,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    time,
    projectId,
    permission,
    grantee,
  };
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

/**
 * Applies the event to the given project, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified project
 * is automatically validated when obtained using
 * `project_eventsourcing.ts`:`newProjectFromEvent`.
 */
export function mutate(project: Project.Project, event: Event): Result.Type<void> {
  if (event.type !== "project_permission_granted") {
    return new VError(`illegal event type: ${event.type}`);
  }

  const eligibleIdentities = project.permissions[event.permission] || [];
  if (!eligibleIdentities.includes(event.grantee)) {
    eligibleIdentities.push(event.grantee);
  }

  project.permissions[event.permission] = eligibleIdentities;
}
