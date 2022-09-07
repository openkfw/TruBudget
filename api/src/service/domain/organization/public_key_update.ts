import Joi = require("joi");

import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { Organization, PublicKeyBase64 } from "./public_key";
import { sourcePublicKeys } from "./public_key_eventsourcing";
import * as PublicKeyPublished from "./public_key_published";
import { ServiceUser } from "./service_user";

export interface RequestData {
  organization: Organization;
  publicKey: PublicKeyBase64;
}

const requestDataSchema = Joi.object({
  organization: Joi.string().required(),
  publicKey: Joi.string().base64().required(),
});

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  getPublicKey(organization): Promise<Result.Type<PublicKeyBase64>>;
}

export async function updatePublicKey(
  ctx: Ctx,
  creatingUser: ServiceUser,
  requestData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent>> {
  const { organization, publicKey } = requestData;

  logger.trace("Checking if public key already exists");
  const publicKeyBase64Result = await repository.getPublicKey(organization);
  if (Result.isErr(publicKeyBase64Result)) {
    return new VError(publicKeyBase64Result, "couldn't get public key");
  }

  if (publicKey === publicKeyBase64Result) {
    return new Error(`the same public key is already stored for ${organization}`);
  }

  const createEvent = PublicKeyPublished.createEvent(
    ctx.source,
    creatingUser.id,
    organization,
    publicKey,
  );
  if (Result.isErr(createEvent)) {
    return new VError(createEvent, "failed to create publish public key event");
  }

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourcePublicKeys(ctx, [createEvent]);
  if (errors.length > 0) {
    return new InvalidCommand(ctx, createEvent, errors);
  }

  return createEvent;
}
