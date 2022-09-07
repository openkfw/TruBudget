import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type EventTypeType = "workflowitem_closed";
const eventType: EventTypeType = "workflowitem_closed";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId: Workflowitem.Id;
  rejectReason?: string;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: Workflowitem.idSchema.required(),
  rejectReason: Joi.string().optional(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  time: string = new Date().toISOString(),
  rejectReason?: string,
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    time,
    projectId,
    subprojectId,
    workflowitemId,
    rejectReason,
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
 * Applies the event to the given workflowitem, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified
 * workflowitem is automatically validated when obtained using
 * `workflowitem_eventsourcing.ts`:`newWorkflowitemFromEvent`.
 */
export function mutate(workflowitem: Workflowitem.Workflowitem, event: Event): Result.Type<void> {
  if (event.type !== "workflowitem_closed") {
    return new VError(`illegal event type: ${event.type}`);
  }

  // Set billing date to the event timestamp if it makes sense for the amount type and
  // isn't set already:
  if (workflowitem.billingDate === undefined && workflowitem.amountType !== "N/A") {
    workflowitem.billingDate = event.time;
  }

  workflowitem.status = "closed";
  if (event.rejectReason) workflowitem.rejectReason = event.rejectReason;
}
