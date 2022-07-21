import Joi = require("joi");

import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { AlreadyExists } from "../errors/already_exists";
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
  publicKeyAlreadyExists(organization: string): Promise<Result.Type<boolean>>;
}

export async function publishPublicKey(
  ctx: Ctx,
  creatingUser: ServiceUser,
  requestData: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent>> {
  const { organization } = requestData;
  const publicKey = requestData.publicKey.replace(/\\n/gm, "\n");
  const buffer = Buffer.from(publicKey, "utf8");
  const publicKeyBase64 = buffer.toString("base64");
  const createEvent = PublicKeyPublished.createEvent(
    ctx.source,
    creatingUser.id,
    organization,
    publicKeyBase64,
  );

  logger.trace({ createEvent }, "event to publish public key created");
  if (Result.isErr(createEvent)) {
    return new VError(createEvent, "failed to create publish public key event");
  }

  const publicKeyExistsResult = await repository.publicKeyAlreadyExists(organization);
  if (Result.isErr(publicKeyExistsResult)) {
    return new VError(publicKeyExistsResult, "public key exists check failed");
  }

  const publicKeyExists = publicKeyExistsResult;
  if (publicKeyExists) {
    return new AlreadyExists(ctx, createEvent, createEvent.publicKey);
  }

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourcePublicKeys(ctx, [createEvent]);
  if (errors.length > 0) {
    return new InvalidCommand(ctx, createEvent, errors);
  }

  return createEvent;
}
