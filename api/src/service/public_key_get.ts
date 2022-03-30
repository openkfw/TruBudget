import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as PublicKeyGet from "./domain/organization/public_key_get";
import { PublicKeyBase64 } from "./domain/organization/public_key";
import logger from "lib/logger";

export async function getPublicKey(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
): Promise<Result.Type<PublicKeyBase64>> {
  logger.debug("Getting public key");

  return Cache.withCache(conn, ctx, async (cache) =>
    PublicKeyGet.getPublicKey(ctx, organization, {
      getPublicKeysEvents: async () => cache.getPublicKeyEvents(),
    }),
  );
}
