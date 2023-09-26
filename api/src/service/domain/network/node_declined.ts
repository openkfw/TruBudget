import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
// TODO this event probably doesn't need user metadata - is it always issued by "system"?
import { UserMetadata, userMetadataSchema } from "../metadata";

type EventTypeType = "node_declined";
const eventType: EventTypeType = "node_declined";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  address: string;
  organization: string;
  declinerAddress: string;
  declinerOrganization: string;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  address: Joi.string().required(),
  organization: Joi.string().required(),
  declinerAddress: Joi.string().required(),
  declinerOrganization: Joi.string().required(),
  metadata: userMetadataSchema,
}).options({ stripUnknown: true });

export function createEvent(
  source: string,
  publisher: Identity,
  address: string,
  organization: string,
  declinerAddress: string,
  declinerOrganization: string,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    address,
    organization,
    declinerAddress,
    declinerOrganization,
    time,
    metadata,
  };
  logger.trace("Creating node declinded event");

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
