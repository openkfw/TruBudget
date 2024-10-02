import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as ProvisioningStart from "./domain/system_information/provisioning_start";
import { store } from "./store";

export async function setProvisioningStartFlag(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<void>> {
  logger.debug("Set Flag to signal start of provisioning");

  const provisioningStartEventResult = await Cache.withCache(conn, ctx, async (_cache) =>
    ProvisioningStart.setProvisioningStartFlag(ctx, serviceUser),
  );

  if (Result.isErr(provisioningStartEventResult)) {
    return new VError(provisioningStartEventResult, "start provisioning failed");
  }

  const provisioningStartEvent = provisioningStartEventResult;

  await store(conn, ctx, provisioningStartEvent, serviceUser.address);
}
