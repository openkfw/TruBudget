import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { store } from "./store";
import * as PublishStorageServiceUrl from "./domain/document/storage_service_url_update";
import { ServiceUser } from "./domain/organization/service_user";
import logger from "lib/logger";

export async function storageServiceUrlPublish(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: PublishStorageServiceUrl.RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ req: requestData }, "Updating storage service url");

  const updateOrganizationUrlResult = await Cache.withCache(conn, ctx, async (cache) => {
    return PublishStorageServiceUrl.storageServiceUrlPublish(ctx, serviceUser, requestData);
  });

  if (Result.isErr(updateOrganizationUrlResult))
    return new VError(updateOrganizationUrlResult, "organization url update document failed");

  await store(conn, ctx, updateOrganizationUrlResult, serviceUser.address);
}
