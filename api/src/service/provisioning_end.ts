import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisioningEnd from "./domain/workflow/provisioning_end";
import { store } from "./store";

export async function endProvisioning(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<void>> {
  const provisioningEndResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProvisioningEnd.endProvisioning(ctx, serviceUser),
  );

  if (Result.isErr(provisioningEndResult)) {
    return new VError(provisioningEndResult, "end provisioning failed");
  }
  const { newEvents } = provisioningEndResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
