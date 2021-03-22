import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import * as ProvisioningStarted from "./provisioning_started";

export async function startProvisioning(
  ctx: Ctx,
  issuer: ServiceUser,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  // Check authorization (only root):
  if (issuer.id !== "root") {
    const intent = "provisioning.start";
    return new NotAuthorized({ ctx, userId: issuer.id, intent });
  }

  // Create the new event:
  const provisioningStartedResult = ProvisioningStarted.createEvent(ctx.source, issuer.id);
  if (Result.isErr(provisioningStartedResult)) {
    return new VError(provisioningStartedResult, "failed to create event");
  }
  const provisioningStarted = provisioningStartedResult;

  return { newEvents: [provisioningStarted] };
}
