import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import * as Subproject from "./subproject";

type EventTypeType = "subproject_closed";
const eventType: EventTypeType = "subproject_closed";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    time,
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
 * Applies the event to the given subproject, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified
 * subproject is automatically validated when obtained using
 * `subproject_eventsourcing.ts`:`newSubprojectFromEvent`.
 */
export function mutate(subproject: Subproject.Subproject, event: Event): Result.Type<void> {
  if (event.type !== "subproject_closed") {
    return new VError(`illegal event type: ${event.type}`);
  }

  subproject.status = "closed";
}
