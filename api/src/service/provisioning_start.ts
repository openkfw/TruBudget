import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisioningStart from "./domain/system_information/provisioning_start";
import { store } from "./store";

export async function startProvisioning(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<void>> {
  const provisioningStartEventResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProvisioningStart.startProvisioning(ctx, serviceUser),
  );

  if (Result.isErr(provisioningStartEventResult)) {
    return new VError(provisioningStartEventResult, "start provisioning failed");
  }

  const provisioningStartEvent = provisioningStartEventResult;

  for (const event of provisioningStartEvent) {
    await store(conn, ctx, event);
  }
}
