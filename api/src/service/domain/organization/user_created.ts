import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as UserRecord from "../organization/user_record";
import { Permissions, permissionsSchema } from "../permissions";
import { Identity } from "./identity";

type EventTypeType = "user_created";
const eventType: EventTypeType = "user_created";

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
}).options({ stripUnknown: true });

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  user: InitialData;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  user: initialDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  user: InitialData,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating user_create event...");

  const event = {
    type: eventType,
    source,
    publisher,
    user,
    time,
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

export function createFrom(ctx: Ctx, event: Event): Result.Type<UserRecord.UserRecord> {
  const initialData = event.user;

  const user: UserRecord.UserRecord = {
    id: initialData.id,
    createdAt: event.time,
    displayName: initialData.displayName,
    organization: initialData.organization,
    passwordHash: initialData.passwordHash,
    address: initialData.address,
    encryptedPrivKey: initialData.encryptedPrivKey,
    permissions: initialData.permissions,
    log: [],
    additionalData: initialData.additionalData,
  };

  return Result.mapErr(
    UserRecord.validate(user),
    (error) => new EventSourcingError({ ctx, event, target: user }, error),
  );
}
