import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisioningEnd from "./domain/system_information/provisioning_end";
import { store } from "./store";

export async function setProvisioningEndFlag(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<void>> {
  logger.debug("Setting flag to signal end of provisioning");

  const provisioningEndEventResult = await Cache.withCache(conn, ctx, async (_cache) =>
    ProvisioningEnd.setProvisioningEndFlag(ctx, serviceUser),
  );

  if (Result.isErr(provisioningEndEventResult)) {
    return new VError(provisioningEndEventResult, "end provisioning failed");
  }

  const provisioningEndEvent = provisioningEndEventResult;

  for (const event of provisioningEndEvent) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
