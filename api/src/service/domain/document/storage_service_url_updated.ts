import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { UserMetadata, userMetadataSchema } from "../metadata";
import { Identity } from "../organization/identity";

type EventTypeType = "storage_service_url_published";
const eventType: EventTypeType = "storage_service_url_published";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  organization: string;
  organizationUrl: string;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  organization: Joi.string().required(),
  organizationUrl: Joi.string().required(),
  metadata: userMetadataSchema,
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  organization: string,
  organizationUrl: string,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    organization,
    organizationUrl,
    time,
    metadata,
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
