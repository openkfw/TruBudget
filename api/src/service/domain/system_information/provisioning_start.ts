import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import * as ProvisioningStarted from "./provisioning_started";
import { sourceSystemInformation } from "./system_information_eventsourcing";

export async function startProvisioning(
  ctx: Ctx,
  issuer: ServiceUser,
): Promise<Result.Type<BusinessEvent[]>> {
  // Check authorization (only root):
  if (issuer.id !== "root") {
    const intent = "provisioning.start";
    return new NotAuthorized({ ctx, userId: issuer.id, intent });
  }

  // Create the new event:
  const provisioningStartedEventResult = ProvisioningStarted.createEvent(ctx.source, issuer.id);
  if (Result.isErr(provisioningStartedEventResult)) {
    return new VError(provisioningStartedEventResult, "failed to create event");
  }
  const provisioningStartedEvent = provisioningStartedEventResult;

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourceSystemInformation(ctx, [provisioningStartedEvent]);
  if (errors.length > 0) {
    return new InvalidCommand(ctx, provisioningStartedEvent, errors);
  }

  return [provisioningStartedEvent];
}
