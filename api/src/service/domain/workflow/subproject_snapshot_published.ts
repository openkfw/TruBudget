import Joi = require("joi");
import { VError } from "verror";

import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";

import * as Subproject from "./subproject";

type EventTypeType = "subproject_snapshot_published";
const eventType: EventTypeType = "subproject_snapshot_published";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: string;
  subproject: Subproject.Subproject;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Joi.string().required(),
  subproject: Subproject.schema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  subproject: Subproject.Subproject,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating subproject_snapshot_published event");
  const event = {
    type: eventType,
    source: source,
    publisher: publisher,
    time: time,
    projectId: subproject.projectId,
    subproject: subproject,
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
