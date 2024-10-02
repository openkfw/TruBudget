import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { sourcePublicKeys } from "./domain/organization/public_key_eventsourcing";
import { getPublicKey } from "./domain/organization/public_key_get";
import * as PublicKeyUpdate from "./domain/organization/public_key_update";
import { ServiceUser } from "./domain/organization/service_user";
import { store } from "./store";

interface PublicKey {
  organization: string;
  publicKey: string;
}

export async function updatePublicKey(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: PublicKeyUpdate.RequestData,
): Promise<Result.Type<PublicKey>> {
  logger.debug({ req: requestData }, "Updating public key");

  const publicKeyUpdateResult = await Cache.withCache(conn, ctx, async (cache) =>
    PublicKeyUpdate.updatePublicKey(ctx, serviceUser, requestData, {
      getPublicKey: async (organization) =>
        getPublicKey(ctx, organization, {
          getPublicKeysEvents: async () => cache.getPublicKeyEvents(),
        }),
    }),
  );

  if (Result.isErr(publicKeyUpdateResult))
    return new VError(publicKeyUpdateResult, "update public key failed");
  const newEvent = publicKeyUpdateResult;

  await store(conn, ctx, newEvent, serviceUser.address);

  const { keysByOrganization } = sourcePublicKeys(ctx, [newEvent]);
  const publicKeyBase64 = keysByOrganization.get(requestData.organization);
  if (publicKeyBase64 !== requestData.publicKey) {
    return new Error(
      `Expected public key to be updated but current published public key for organization ${requestData.organization} is ${publicKeyBase64}`,
    );
  }

  const newPublicKey: PublicKey = {
    organization: requestData.organization,
    publicKey: publicKeyBase64,
  };

  return newPublicKey;
}
