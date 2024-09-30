import Joi = require("joi");
import { VError } from "verror";

import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";

import * as Project from "./project";

type EventTypeType = "project_snapshot_published";
const eventType: EventTypeType = "project_snapshot_published";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  project: Project.Project;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  project: Project.schema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  project: Project.Project,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating project_snapshot_published event");
  const event = {
    type: eventType,
    source: source,
    publisher: publisher,
    time: time,
    project: project,
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
