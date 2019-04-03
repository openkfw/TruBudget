import Joi = require("joi");
import { VError } from "verror";

import Intent, { projectIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import * as Project from "./project";

type eventTypeType = "project_permission_revoked";
const eventType: eventTypeType = "project_permission_revoked";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  permission: Intent;
  revokee: Identity;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string()
    .allow("")
    .required(),
  time: Joi.date()
    .iso()
    .required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  permission: Joi.valid(projectIntents).required(),
  revokee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  permission: Intent,
  revokee: Identity,
  time: string = new Date().toISOString(),
): Event {
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
    throw new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

export function apply(
  ctx: Ctx,
  event: Event,
  project: Project.Project,
): Result.Type<Project.Project> {
  const eligibleIdentities = project.permissions[event.permission];
  if (eligibleIdentities === undefined) {
    // Nothing to do here..
    return project;
  }

  const foundIndex = eligibleIdentities.indexOf(event.revokee);
  const hasPermission = foundIndex !== -1;
  if (hasPermission) {
    // Remove the user from the array:
    eligibleIdentities.splice(foundIndex, 1);
  }

  project.permissions[event.permission] = eligibleIdentities;

  return Result.mapErr(
    Project.validate(project),
    error => new EventSourcingError({ ctx, event, target: project }, error),
  );
}
