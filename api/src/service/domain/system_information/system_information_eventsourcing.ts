import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import logger from "../../../lib/logger";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { ProvisioningState } from "./ProvisioningState";
import * as SystemInformation from "./system_information";
import * as ProvisioningEnded from "./provisioning_ended";
import * as ProvisioningStarted from "./provisioning_started";

export function sourceSystemInformation(
  ctx: Ctx,
  events: BusinessEvent[],
): {
  systemInformation: SystemInformation.SystemInformation;
  errors: EventSourcingError[];
} {
  let provisioningEvents: ProvisioningStarted.Event | ProvisioningEnded.Event[] = [];
  let systemInformation: SystemInformation.SystemInformation = {
    provisioningEvents,
  };
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, systemInformation, event, errors);
  }
  return { systemInformation, errors };
}

function apply(
  ctx: Ctx,
  systemInformation: SystemInformation.SystemInformation,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
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
) {
  systemInformation.provisioningEvents.push(event);
  const result = SystemInformation.validate(systemInformation);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event }, result));
    return;
  }
}

function applyProvisioningEnded(
  ctx: Ctx,
  systemInformation: SystemInformation.SystemInformation,
  event: ProvisioningEnded.Event,
  errors: EventSourcingError[],
) {
  systemInformation.provisioningEvents.push(event);
  const result = SystemInformation.validate(systemInformation);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event }, result));
    return;
  }
}

export function sourceProvisioningState(
  ctx: Ctx,
  events: BusinessEvent[],
): { provisioningState: ProvisioningState; errors: EventSourcingError[] } {
  let message: string = "The Multichain has never been provisioned";
  let isProvisioned: Boolean = false;
  let isStartFlagSet: Boolean = false;
  let isEndFlagSet: Boolean = false;
  const errors: EventSourcingError[] = [];
  const provisioningState: ProvisioningState = { isProvisioned, message };

  try {
    // Iterate through the items from the end to the beginning
    // Provisioning was successfully if  a start-flag is followed by an end-flag
    // eslint-disable-next-line for-direction
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].type === "provisioning_started") {
        isStartFlagSet = true;
        if (isEndFlagSet) {
          provisioningState.message = "The Multichain has already been provisioned successfully";
          provisioningState.isProvisioned = true;
          break;
        }
        if (!isEndFlagSet) {
          provisioningState.message =
            "The Multichain has been provisioned partly (no provisioning_ended flag set)";
          provisioningState.isProvisioned = false;
          break;
        }
        continue;
      }
      if (events[i].type === "provisioning_ended") {
        isEndFlagSet = true;
        // only start flags from the left side of the array from the end flag belongs to the end flag
        isStartFlagSet = false;
      }
    }
  } catch (err) {
    errors.push(err);
    logger.error({ error: err }, "Error during system_information_eventsourcing");
  }

  return { provisioningState, errors };
}
