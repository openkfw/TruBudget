import { VError } from "verror";
import { Ctx } from "lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";
import * as ProvisioningEnded from "./provisioning_ended";
import { sourceSystemInformation } from "./system_information_eventsourcing";
import logger from "lib/logger";

export async function setProvisioningEndFlag(
  ctx: Ctx,
  issuer: ServiceUser,
): Promise<Result.Type<BusinessEvent[]>> {
  logger.trace({ issuer }, "Checking if user is root");
  if (issuer.id !== "root") {
    const intent = "provisioning.end";
    return new NotAuthorized({ ctx, userId: issuer.id, intent });
  }

  const provisioningEndedEventResult = ProvisioningEnded.createEvent(
    ctx.source,
    issuer.id,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(provisioningEndedEventResult)) {
    return new VError(provisioningEndedEventResult, "failed to create event");
  }
  const provisioningEndedEvent = provisioningEndedEventResult;

  logger.trace({ event: provisioningEndedEvent }, "Checking if event is valid");
  const { errors } = sourceSystemInformation(ctx, [provisioningEndedEvent]);
  if (errors.length > 0) {
    return new InvalidCommand(ctx, provisioningEndedEvent, errors);
  }

  return [provisioningEndedEvent];
}
