import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisionedGet from "./domain/system_information/provisioning_get";
import * as SystemInformation from "./domain/system_information/system_information";

export async function getProvisionStatus(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<SystemInformation.ProvisioningStatus>> {
  logger.debug("Getting provisioning status");

  const provisionedResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProvisionedGet.getProvisionStatus(ctx, serviceUser, {
      getSystemInformationEvents: async () => {
        return cache.getSystemEvents();
      },
    }),
  );

  return Result.mapErr(
    provisionedResult,
    (err) => new VError(err, "get provisioned status failed"),
  );
}
