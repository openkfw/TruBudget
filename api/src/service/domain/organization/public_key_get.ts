import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";

import { Organization, PublicKeyBase64 } from "./public_key";
import { KeysByOrganization, sourcePublicKeys } from "./public_key_eventsourcing";

interface Repository {
  getPublicKeysEvents(): Promise<Result.Type<BusinessEvent[]>>;
}

export async function getAllPublicKeys(
  ctx: Ctx,
  repository: Repository,
): Promise<Result.Type<KeysByOrganization>> {
  // No permission checked since every user should be able
  // to list all public keys

  const publicKeysEventsResult = await repository.getPublicKeysEvents();
  if (Result.isErr(publicKeysEventsResult)) {
    return new VError(publicKeysEventsResult, "fetch public_keys events failed");
  }
  // Errors are ignored here
  const { keysByOrganization } = sourcePublicKeys(ctx, publicKeysEventsResult);

  return keysByOrganization;
}

export async function getPublicKey(
  ctx: Ctx,
  organization: Organization,
  repository: Repository,
): Promise<Result.Type<PublicKeyBase64>> {
  // No permission checked since every user should be able
  // to list all public keys
  logger.trace("Fetching public key...");

  const keysByOrganization = await getAllPublicKeys(ctx, repository);
  if (Result.isErr(keysByOrganization)) {
    return new VError(keysByOrganization, "get all public keys failed");
  }

  const publicKey = keysByOrganization.get(organization);
  if (!publicKey) {
    return new VError(
      new NotFound(ctx, "key", "public"),
      `couldn't get public key of organization ${organization}`,
    );
  }
  return publicKey;
}

export async function publicKeyAlreadyExists(
  ctx: Ctx,
  organization: Organization,
  repository: Repository,
): Promise<Result.Type<boolean>> {
  // No permission checked since every user should be able
  // to list all public keys
  logger.trace({ organization }, "Checking if public key already exists");
  const keysByOrganization = await getAllPublicKeys(ctx, repository);
  if (Result.isErr(keysByOrganization)) {
    return new VError(keysByOrganization, "get all public keys failed");
  }
  if (keysByOrganization.get(organization)) {
    return true;
  }
  return false;
}
