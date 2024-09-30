import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";

import * as PublicKey from "./public_key";
import * as PublicKeyCreated from "./public_key_published";
import * as PublicKeyUpdated from "./public_key_updated";

export type KeysByOrganization = Map<PublicKey.Organization, PublicKey.PublicKeyBase64>;

export function sourcePublicKeys(
  ctx: Ctx,
  events: BusinessEvent[],
): { keysByOrganization: KeysByOrganization; errors: EventSourcingError[] } {
  const keysByOrganization = new Map<PublicKey.Organization, PublicKey.PublicKeyBase64>();
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, keysByOrganization, event, errors);
  }
  return { keysByOrganization, errors };
}

function apply(
  ctx: Ctx,
  keyByOrganization: KeysByOrganization,
  event: BusinessEvent,
  errors: EventSourcingError[],
): void {
  if (event.type === "public_key_published") {
    handleCreate(ctx, keyByOrganization, event, errors);
  } else if (event.type === "public_key_updated") {
    handleUpdate(ctx, keyByOrganization, event, errors);
  }
}

function handleCreate(
  ctx: Ctx,
  keyByOrganization: KeysByOrganization,
  publicKeyPublished: PublicKeyCreated.Event,
  errors: EventSourcingError[],
): void {
  logger.trace({ event: publicKeyPublished }, "Handling public_key_published event");
  let publicKeyBase64 = keyByOrganization.get(publicKeyPublished.organization);
  if (publicKeyBase64 !== undefined) {
    errors.push(
      new EventSourcingError(
        { ctx, event: publicKeyPublished, target: publicKeyBase64 },
        "publicKey already exists",
      ),
    );
    return;
  }

  const publicKey: PublicKey.PublicKey = {
    organization: publicKeyPublished.organization,
    publicKey: publicKeyPublished.publicKey,
  };

  const result = PublicKey.validate(publicKey);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: publicKeyPublished }, result));
    return;
  }

  keyByOrganization.set(publicKey.organization, publicKey.publicKey);
}

function handleUpdate(
  ctx: Ctx,
  keyByOrganization: KeysByOrganization,
  publicKeyPublished: PublicKeyUpdated.Event,
  errors: EventSourcingError[],
): void {
  logger.trace({ event: publicKeyPublished }, "Handling public_key_updated event");
  let publicKeyBase64 = keyByOrganization.get(publicKeyPublished.organization);
  if (publicKeyBase64 === undefined) {
    errors.push(
      new EventSourcingError(
        { ctx, event: publicKeyPublished, target: publicKeyBase64 },
        "publicKey does not exist yet",
      ),
    );
    return;
  }

  const publicKey: PublicKey.PublicKey = {
    organization: publicKeyPublished.organization,
    publicKey: publicKeyPublished.publicKey,
  };

  const result = PublicKey.validate(publicKey);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: publicKeyPublished }, result));
    return;
  }

  keyByOrganization.set(publicKey.organization, publicKey.publicKey);
}
