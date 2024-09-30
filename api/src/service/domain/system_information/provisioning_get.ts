import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotAuthorized } from "../errors/not_authorized";
import { ServiceUser } from "../organization/service_user";

import * as SystemInformation from "./system_information";
import { sourceSystemInformation } from "./system_information_eventsourcing";

interface Repository {
  getSystemInformationEvents(): Promise<Result.Type<BusinessEvent[]>>;
}

export async function getProvisionStatus(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Result.Type<SystemInformation.ProvisioningStatus>> {
  logger.trace({ user }, "Checking if user is root");
  if (user.id !== "root") {
    const intent: Intent = "provisioning.get";
    return new NotAuthorized({
      ctx,
      userId: user.id,
      intent,
    });
  }

  const systemInformationEventsResult = await repository.getSystemInformationEvents();
  if (Result.isErr(systemInformationEventsResult)) {
    return new VError(systemInformationEventsResult, "failed to get system information events");
  }

  const { systemInformation, errors } = sourceSystemInformation(ctx, systemInformationEventsResult);

  // Only return first error if there are any
  if (errors.length > 0) {
    return errors[0];
  }

  return systemInformation.provisioningStatus;
}
