import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";

type EventTypeType = "project_closed";
const eventType: EventTypeType = "project_closed";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    time,
    projectId,
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
  if (event.type !== "project_closed") {
    return new VError(`illegal event type: ${event.type}`);
  }

  project.status = "closed";
}
