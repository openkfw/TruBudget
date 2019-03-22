import Joi = require("joi");
import { VError } from "verror";

import Intent, { subprojectIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import * as Subproject from "./subproject";

type eventTypeType = "subproject_permission_granted";
const eventType: eventTypeType = "subproject_permission_granted";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  permission: Intent;
  grantee: Identity;
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
  grantee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  permission: Intent,
  grantee: Identity,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    permission,
    grantee,
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
  const eligibleIdentities = subproject.permissions[event.permission] || [];
  if (!eligibleIdentities.includes(event.grantee)) {
    eligibleIdentities.push(event.grantee);
  }

  subproject.permissions[event.permission] = eligibleIdentities;

  const result = Subproject.validate(subproject);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, subproject.id);
  }

  return subproject;
}
