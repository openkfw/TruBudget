import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";

import * as ProvisioningEnded from "./provisioning_ended";
import * as ProvisioningStarted from "./provisioning_started";
import * as SystemInformation from "./system_information";

export function sourceSystemInformation(
  ctx: Ctx,
  events: BusinessEvent[],
): {
  systemInformation: SystemInformation.SystemInformation;
  errors: EventSourcingError[];
} {
  let systemInformation: SystemInformation.SystemInformation = {
    provisioningStatus: {
      isProvisioned: false,
      message: "Not provisioned yet.",
    },
  };
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    logger.trace({ event }, "Applying system information event");
    apply(ctx, systemInformation, event, errors);
  }
  return { systemInformation, errors };
}

function apply(
  ctx: Ctx,
  systemInformation: SystemInformation.SystemInformation,
  event: BusinessEvent,
  errors: EventSourcingError[],
): void {
  if (event.type === "provisioning_started") {
    applyProvisioningStarted(ctx, systemInformation, event, errors);
  }
  if (event.type === "provisioning_ended") {
    applyProvisioningEnded(ctx, systemInformation, event, errors);
  }
}

function applyProvisioningStarted(
  ctx: Ctx,
  systemInformation: SystemInformation.SystemInformation,
  event: ProvisioningStarted.Event,
  errors: EventSourcingError[],
): void {
  // Ignore all start events if the provisioning end flag is set
  if (systemInformation.provisioningStatus.isProvisioned) {
    return;
  }
  systemInformation.provisioningStatus = {
    isProvisioned: false,
    message: "Provisioning started flag set.",
  };
  const result = SystemInformation.validate(systemInformation);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event }, result));
  }
}

function applyProvisioningEnded(
  ctx: Ctx,
  systemInformation: SystemInformation.SystemInformation,
  event: ProvisioningEnded.Event,
  errors: EventSourcingError[],
): void {
  systemInformation.provisioningStatus = {
    isProvisioned: true,
    message: "Provisioning ended flag set. Trubudget seems to be provisioned.",
  };
  const result = SystemInformation.validate(systemInformation);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event }, result));
    return;
  }
}
