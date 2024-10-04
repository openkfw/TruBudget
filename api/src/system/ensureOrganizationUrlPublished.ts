import { VError } from "verror";

import { config } from "../config";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "../service/conn";
import { ServiceUser } from "../service/domain/organization/service_user";
import { getselfaddress } from "../service/getselfaddress";
import { storageServiceUrlGet } from "../service/storage_service_url_get";
import { storageServiceUrlPublish } from "../service/storage_service_url_update";

type Organization = string;

export default async function ensureStorageServiceUrlPublished(
  conn: ConnToken,
  organization: Organization,
): Promise<Result.Type<void>> {
  const ctx: Ctx = { requestId: "system", source: "internal" };
  const nodeAddress = await getselfaddress(conn.multichainClient);
  const serviceUser: ServiceUser = { id: "system", groups: [], address: nodeAddress };

  const storageServiceUrl = `${config.storageService.externalUrl}`;
  const storageServiceUrlOnChain = await storageServiceUrlGet(conn, ctx, config.organization); // will be undefined if this is the first time starting the api

  if (Result.isErr(storageServiceUrlOnChain))
    return new VError(
      storageServiceUrlOnChain,
      `failed to get the storage service url for the organizaiton ${organization}`,
    );
  let result;

  if (storageServiceUrl !== storageServiceUrlOnChain) {
    result = await storageServiceUrlPublish(conn, ctx, serviceUser, {
      organization,
      organizationUrl: storageServiceUrl,
    });
  }

  return Result.mapErr(
    result,
    (err) => new VError(err, "Ensure storage service url published failed"),
  );
}
