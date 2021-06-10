import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import { VError } from "verror";
import * as Result from "../../../result";
import Intent from "../../../authz/intents";
import { NotAuthorized } from "../errors/not_authorized";
import { sourceProvisioningState } from "./system_information_eventsourcing";
import { ProvisioningState } from "./ProvisioningState";

interface Repository {
  getSystemEvents(): Promise<BusinessEvent[]>;
}

export async function getProvisioningState(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Result.Type<ProvisioningState>> {
  // Check authorization (only root):
  if (user.id !== "root") {
    const intent: Intent = "provisioning.get";
    return new NotAuthorized({
      ctx,
      userId: user.id,
      intent,
    });
  }
  const allSystemEvents = await repository.getSystemEvents();
  const { provisioningState } = sourceProvisioningState(ctx, allSystemEvents);
  return provisioningState;
}
