import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Filter, filterTraceEvents } from "./historyFilter";
import * as Subproject from "./subproject";
import { SubprojectTraceEvent } from "./subproject_trace_event";

interface Repository {
  getSubproject(projectId, subprojectId): Promise<Result.Type<Subproject.Subproject>>;
}

export const getHistory = async (
  ctx: Ctx,
  user: ServiceUser,
  projectId: string,
  subprojectId: string,
  repository: Repository,
  filter?: Filter,
): Promise<Result.Type<SubprojectTraceEvent[]>> => {
  const subproject = await repository.getSubproject(projectId, subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  if (user.id !== "root") {
    const intents: Intent[] = ["subproject.viewDetails", "subproject.viewHistory"];
    if (!(Subproject.permits(subproject, user, [intents[0]]) ||
    Subproject.permits(subproject, user, [intents[1]]))) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: subproject });
    }
  }

  let subprojectTraceEvents = subproject.log;

  if (filter) {
    subprojectTraceEvents = filterTraceEvents(subprojectTraceEvents, filter);
  }

  return subprojectTraceEvents;
};
