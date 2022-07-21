import Joi = require("joi");
import logger from "../../../lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";

type SecretPublishedEventTypeType = "secret_published";
const secretPublishedEventType: SecretPublishedEventTypeType = "secret_published";

export interface SecretPublished {
  docId: string;
  organization: string;
  encryptedSecret: string;
}

export interface Event {
  type: SecretPublishedEventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  docId: string;
  organization: string;
  encryptedSecret: string;
}

export const schema = Joi.object({
  type: Joi.valid(secretPublishedEventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  docId: Joi.string().required(),
  organization: Joi.string().required(),
  encryptedSecret: Joi.string().required(),
});

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

export function createEvent(
  source: string,
  publisher: Identity,
  docId: string,
  organization: string,
  encryptedSecret: string,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: secretPublishedEventType,
    source,
    time,
    publisher,
    docId,
    organization,
    encryptedSecret,
  };

  logger.trace({ event }, "Creating and validating secret_published event");
  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${secretPublishedEventType} event`);
  }

  return event;
}

const secretSchema = Joi.object().keys({
  docId: Joi.string().required(),
  organization: Joi.string().required(),
  encryptedSecret: Joi.string().required(),
});

export function validateSecret(input): Result.Type<SecretPublished> {
  const { error } = secretSchema.validate(input);
  return error === undefined ? (input as SecretPublished) : error;
}
