import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";

type eventTypeType = "node_registered";
const eventType: eventTypeType = "node_registered";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  address: string;
  organization: string;
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
  address: Joi.string().required(),
  organization: Joi.string().required(),
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  address: string,
  organization: string,
  time: string = new Date().toISOString(),
): Result.Type<Event>  {
  const event = {
    type: eventType,
    source,
    publisher,
    address,
    organization,
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
