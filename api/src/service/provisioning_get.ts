import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisionedGet from "./domain/system_information/provisioning_get";
import { VError } from "verror";
import * as Result from "../result";
import { ProvisioningState } from "./domain/system_information/ProvisioningState";

export async function getProvisionStatus(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<ProvisioningState>> {
  const provisionedResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProvisionedGet.getProvisioningState(ctx, serviceUser, {
      getSystemEvents: async () => {
        return cache.getSystemEvents();
      },
    }),
  );
  return Result.mapErr(
    provisionedResult,
    (err) => new VError(err, "get provisioned status failed"),
  );
}
