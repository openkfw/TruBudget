import Joi = require("joi");
import { VError } from "verror";

import Intent, { workflowitemIntents } from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type eventTypeType = "workflowitem_permission_granted";
const eventType: eventTypeType = "workflowitem_permission_granted";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId: Workflowitem.Id;
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
  workflowitemId: Workflowitem.idSchema.required(),
  permission: Joi.valid(workflowitemIntents).required(),
  grantee: Joi.string().required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
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
    workflowitemId,
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
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<Workflowitem.Workflowitem> {
  const eligibleIdentities = workflowitem.permissions[event.permission] || [];
  if (!eligibleIdentities.includes(event.grantee)) {
    eligibleIdentities.push(event.grantee);
  }

  const result = Workflowitem.validate(workflowitem);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, workflowitem.id);
  }

  return workflowitem;
}
