import Joi = require("joi");
import { VError } from "verror";

import Intent, { subprojectIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import * as Subproject from "./subproject";

type eventTypeType = "subproject_permission_revoked";
const eventType: eventTypeType = "subproject_permission_revoked";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
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
  subprojectId: Subproject.idSchema.required(),
  permission: Joi.valid(subprojectIntents).required(),
  revokee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  permission: Intent,
  revokee: Identity,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    permission,
    revokee,
    time,
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
  subproject: Subproject.Subproject,
): Result.Type<Subproject.Subproject> {
  const eligibleIdentities = subproject.permissions[event.permission];
  if (eligibleIdentities === undefined) {
    // Nothing to do here..
    return subproject;
  }

  const foundIndex = eligibleIdentities.indexOf(event.revokee);
  const hasPermission = foundIndex !== -1;
  if (hasPermission) {
    // Remove the user from the array:
    eligibleIdentities.splice(foundIndex, 1);
  }

  subproject.permissions[event.permission] = eligibleIdentities;

  const result = Subproject.validate(subproject);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, subproject.id);
  }

  return subproject;
}
