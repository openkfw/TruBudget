import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Identity } from "../organization/identity";
import { Permissions, permissionsSchema } from "../permissions";
import * as Group from "./group";

type eventTypeType = "group_created";
const eventType: eventTypeType = "group_created";

interface InitialData {
  id: Group.Id;
  displayName: string;
  description: string;
  members: Group.Member[];
  permissions: Permissions;
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
}

const initialDataSchema = Joi.object({
  id: Group.idSchema.required(),
  displayName: Joi.string().required(),
  description: Joi.string()
    .allow("")
    .required(),
  members: Group.membersSchema.required(),
  permissions: permissionsSchema.required(),
  additionalData: AdditionalData.schema.required(),
}).options({ stripUnknown: true });

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  group: InitialData;
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
  group: initialDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  group: InitialData,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    group,
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
