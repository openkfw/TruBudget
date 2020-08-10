import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Subproject from "./subproject";
import { SubprojectTraceEvent } from "./subproject_trace_event";
import { NotAuthorized } from "../errors/not_authorized";

export interface Filter {
  publisher: Identity;
  startAt: string; // ISO timestamp
  endAt: string; // ISO timestamp
  eventType: Identity;
}

interface Repository {
  getSubproject(projectId, subprojectId): Promise<Result.Type<Subproject.Subproject>>;
}

export const getHistory = async (
  ctx: Ctx,
  user: ServiceUser,
  projectId: string,
  subprojectId: string,
  filter: Filter,
  repository: Repository,
): Promise<Result.Type<SubprojectTraceEvent[]>> => {
  const subproject = await repository.getSubproject(projectId, subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  if (user.id !== "root") {
    const intents: Intent[] = ["subproject.viewDetails"];
    if (!Subproject.permits(subproject, user, intents)) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: subproject });
    }
  }

  let subprojectTraceEvents = subproject.log;

  if (filter.publisher) {
    // Publisher id must match exactly
    subprojectTraceEvents = subprojectTraceEvents.filter(
      (event) => event.businessEvent.publisher === filter.publisher,
    );
  }

  if (filter.startAt) {
    subprojectTraceEvents = subprojectTraceEvents.filter(
      (event) => new Date(event.businessEvent.time) >= new Date(filter.startAt),
    );
  }

  if (filter.endAt) {
    subprojectTraceEvents = subprojectTraceEvents.filter(
      (event) => new Date(event.businessEvent.time) <= new Date(filter.endAt),
    );
  }

  if (filter.eventType) {
    // Event type must match exactly
    subprojectTraceEvents = subprojectTraceEvents.filter(
      (event) => event.businessEvent.type === filter.eventType,
    );
  }

  return subprojectTraceEvents;
};
