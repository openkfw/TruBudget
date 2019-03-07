import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import * as UserRecord from "../organization/user_record";
import { Permissions, permissionsSchema } from "../permissions";
import { Identity } from "./identity";

type eventTypeType = "user_created";
const eventType: eventTypeType = "user_created";

interface InitialData {
  id: UserRecord.Id;
  displayName: string;
  organization: string;
  passwordHash: string;
  address: string;
  encryptedPrivKey: string;
  permissions: Permissions;
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
}

const initialDataSchema = Joi.object({
  id: UserRecord.idSchema.required(),
  displayName: Joi.string().required(),
  organization: Joi.string().required(),
  passwordHash: Joi.string().required(),
  address: Joi.string().required(),
  encryptedPrivKey: Joi.string().required(),
  permissions: permissionsSchema.required(),
  additionalData: AdditionalData.schema.required(),
});

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  user: InitialData;
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
  user: initialDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  user: InitialData,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    user,
    time,
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
