import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { ProjectTraceEvent } from "./project_trace_event";
import { NotAuthorized } from "../errors/not_authorized";

export interface Filter {
  publisher: Identity;
  startAt: string; // ISO timestamp
  endAt: string; // ISO timestamp
  eventType: Identity;
}

interface Repository {
  getProject(projectId): Promise<Result.Type<Project.Project>>;
}

export const getHistory = async (
  ctx: Ctx,
  user: ServiceUser,
  projectId: string,
  filter: Filter,
  repository: Repository,
): Promise<Result.Type<ProjectTraceEvent[]>> => {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  if (user.id !== "root") {
    const intents: Intent[] = ["project.viewDetails"];
    if (!Project.permits(project, user, intents)) {
      return new NotAuthorized({ ctx, userId: user.id, intent: intents, target: project });
    }
  }

  let projectTraceEvents = project.log;

  if (filter.publisher) {
    // Publisher id must match exactly
    projectTraceEvents = projectTraceEvents.filter(
      (event) => event.businessEvent.publisher === filter.publisher,
    );
  }

  if (filter.startAt) {
    projectTraceEvents = projectTraceEvents.filter(
      (event) => new Date(event.businessEvent.time) >= new Date(filter.startAt),
    );
  }

  if (filter.endAt) {
    projectTraceEvents = projectTraceEvents.filter(
      (event) => new Date(event.businessEvent.time) <= new Date(filter.endAt),
    );
  }

  if (filter.eventType) {
    // Event type must match exactly
    projectTraceEvents = projectTraceEvents.filter(
      (event) => event.businessEvent.type === filter.eventType,
    );
  }

  return projectTraceEvents;
};
