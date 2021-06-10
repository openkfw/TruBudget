import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import * as ProvisioningEnded from "./provisioning_ended";
import { sourceSystemInformation } from "./system_information_eventsourcing";

export async function endProvisioning(
  ctx: Ctx,
  issuer: ServiceUser,
): Promise<Result.Type<BusinessEvent[]>> {
  // Check authorization (only root):
  if (issuer.id !== "root") {
    const intent = "provisioning.end";
    return new NotAuthorized({ ctx, userId: issuer.id, intent });
  }

  // Create the new event:
  const provisioningEndedEventResult = ProvisioningEnded.createEvent(ctx.source, issuer.id);
  if (Result.isErr(provisioningEndedEventResult)) {
    return new VError(provisioningEndedEventResult, "failed to create event");
  }
  const provisioningEndedEvent = provisioningEndedEventResult;

  // Check that the event is valid by trying to "apply" it:
  const { errors } = sourceSystemInformation(ctx, [provisioningEndedEvent]);
  if (errors.length > 0) {
    return new InvalidCommand(ctx, provisioningEndedEvent, errors);
  }

  return [provisioningEndedEvent];
}
