import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisioningStart from "./domain/workflow/provisioning_start";
import { store } from "./store";

export async function startProvisioning(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<void>> {
  const provisioningStartResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProvisioningStart.startProvisioning(ctx, serviceUser),
  );

  if (Result.isErr(provisioningStartResult)) {
    return new VError(provisioningStartResult, "start provisioning failed");
  }
  const { newEvents } = provisioningStartResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
