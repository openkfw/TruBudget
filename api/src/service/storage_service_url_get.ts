import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as GetStorageServiceUrl from "./domain/document/storage_service_url_get";

export async function storageServiceUrlGet(
  conn: ConnToken,
  ctx: Ctx,
  organization: string,
): Promise<Result.Type<string | undefined>> {
  logger.debug("Getting storage service url");

  const storageServiceUrlResult = await Cache.withCache(conn, ctx, async (cache) => {
    return GetStorageServiceUrl.getStorageServiceUrl(organization, {
      getStorageServiceUrlPublishedEvents: async () => {
        return cache.getStorageServiceUrlPublishedEvents();
      },
    });
  });

  if (Result.isErr(storageServiceUrlResult))
    return new VError(
      storageServiceUrlResult,
      `failed to get a storage service url for organizaiton ${organization}`,
    );
  return storageServiceUrlResult;
}
