import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import * as ProvisioningEnded from "./provisioning_ended";

export async function endProvisioning(
  ctx: Ctx,
  issuer: ServiceUser,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  // Check authorization (only root):
  if (issuer.id !== "root") {
    const intent = "provisioning.end";
    return new NotAuthorized({ ctx, userId: issuer.id, intent });
  }

  // Create the new event:
  const provisioningEndedResult = ProvisioningEnded.createEvent(ctx.source, issuer.id);
  if (Result.isErr(provisioningEndedResult)) {
    return new VError(provisioningEndedResult, "failed to create event");
  }
  const provisioningEnded = provisioningEndedResult;

  return { newEvents: [provisioningEnded] };
}
