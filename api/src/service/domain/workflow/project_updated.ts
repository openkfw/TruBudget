import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";

type eventTypeType = "project_updated";
const eventType: eventTypeType = "project_updated";

/**
 * We only support updating very few fields with this command. For example,
 * `projectedBudgets` is not included here, because the semantics of updating it this
 * way are not quite clear, plus we want such a change to be explicit by causing a
 * dedicated event.
 */
interface Modification {
  displayName?: string;
  description?: string;
  thumbnail?: string;
}

const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  thumbnail: Joi.string().allow(""),
});

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  update: Modification;
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
  update: modificationSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  modification: Modification,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    time,
    projectId,
    update: modification,
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
