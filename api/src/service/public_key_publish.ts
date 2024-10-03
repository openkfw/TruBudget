import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { sourcePublicKeys } from "./domain/organization/public_key_eventsourcing";
import { publicKeyAlreadyExists } from "./domain/organization/public_key_get";
import * as PublicKeyPublish from "./domain/organization/public_key_publish";
import { ServiceUser } from "./domain/organization/service_user";
import { store } from "./store";

interface PublicKey {
  organization: string;
  publicKey: string;
}

export async function publishPublicKey(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: PublicKeyPublish.RequestData,
): Promise<Result.Type<PublicKey>> {
  logger.debug({ req: requestData }, "Publishing public key");

  const publicKeyPublishResult = await Cache.withCache(conn, ctx, async (cache) =>
    PublicKeyPublish.publishPublicKey(ctx, serviceUser, requestData, {
      publicKeyAlreadyExists: async (organization) =>
        publicKeyAlreadyExists(ctx, organization, {
          getPublicKeysEvents: async () => cache.getPublicKeyEvents(),
        }),
    }),
  );

  if (Result.isErr(publicKeyPublishResult))
    return new VError(publicKeyPublishResult, "publish public key failed");
  const newEvent = publicKeyPublishResult;

  // Ensure event is valid by applying it
  const { keysByOrganization } = sourcePublicKeys(ctx, [newEvent]);
  const publicKeyBase64 = keysByOrganization.get(requestData.organization);
  if (publicKeyBase64 === undefined) {
    return new Error(
      `Expected public key published but couldn't fetch it for organization ${requestData.organization}`,
    );
  }

  await store(conn, ctx, newEvent, serviceUser.address);
  logger.info("Public key published successfully.");

  const newPublicKey: PublicKey = {
    organization: requestData.organization,
    publicKey: publicKeyBase64,
  };

  return newPublicKey;
}
