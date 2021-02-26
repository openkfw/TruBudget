import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";

type EventTypeType = "document_secret_published";
const eventType: EventTypeType = "document_secret_published";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  organization: string;
  documentId: string;
  encryptedSecret: string;
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
  organization: Joi.string().required(),
  documentId: Joi.string().required(),
  encryptedSecret: Joi.string().required(),
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  organization: string,
  documentId: string,
  encryptedSecret: string,
  time: string = new Date().toISOString(),
): Result.Type<Event>  {
  const event = {
    type: eventType,
    source,
    publisher,
    organization,
    documentId,
    encryptedSecret,
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
