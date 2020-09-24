import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import { Filter, filterTraceEvents } from "./historyFilter";
import * as Project from "./project";
import { ProjectTraceEvent } from "./project_trace_event";

interface Repository {
  getProject(projectId): Promise<Result.Type<Project.Project>>;
}

export const getHistory = async (
  ctx: Ctx,
  user: ServiceUser,
  projectId: string,
  repository: Repository,
  filter?: Filter,
): Promise<Result.Type<ProjectTraceEvent[]>> => {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  if (user.id !== "root") {
    const intents: Intent[] = ["project.viewDetails", "project.viewHistory"];
    if (!(Project.permits(project, user, [intents[0]]) ||
    Project.permits(project, user, [intents[1]]))) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: project });
    }
  }

  let projectTraceEvents = project.log;

  if (filter) {
    projectTraceEvents = filterTraceEvents(projectTraceEvents, filter);
  }

  return projectTraceEvents;
};
