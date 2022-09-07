import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import Intent, { projectIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";

type EventTypeType = "project_permission_revoked";
const eventType: EventTypeType = "project_permission_revoked";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  permission: Intent;
  revokee: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  permission: Joi.valid(...projectIntents).required(),
  revokee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  permission: Intent,
  revokee: Identity,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating project_premission_revoked event");

  const event = {
    type: eventType,
    source,
    publisher,
    time,
    projectId,
    permission,
    revokee,
  };
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
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
  logger.trace({ event, project }, "Applying event to the given project");
  if (event.type !== "project_permission_revoked") {
    return new VError(`illegal event type: ${event.type}`);
  }

  const eligibleIdentities = project.permissions[event.permission];
  if (eligibleIdentities === undefined) {
    // Nothing to do here..
    return;
  }

  const foundIndex = eligibleIdentities.indexOf(event.revokee);
  const hasPermission = foundIndex !== -1;
  if (hasPermission) {
    // Remove the user from the array:
    eligibleIdentities.splice(foundIndex, 1);
  }
}
