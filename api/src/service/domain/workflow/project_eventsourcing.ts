import { produce } from "immer";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as Project from "./project";
import * as ProjectAssigned from "./project_assigned";
import * as ProjectClosed from "./project_closed";
import * as ProjectCreated from "./project_created";
import * as ProjectPermissionGranted from "./project_permission_granted";
import * as ProjectPermissionRevoked from "./project_permission_revoked";
import * as ProjectProjectedBudgetDeleted from "./project_projected_budget_deleted";
import * as ProjectProjectedBudgetUpdated from "./project_projected_budget_updated";
import { ProjectTraceEvent } from "./project_trace_event";
import * as ProjectUpdated from "./project_updated";

export function sourceProjects(
  ctx: Ctx,
  events: BusinessEvent[],
  origin?: Map<Project.Id, Project.Project>,
): { projects: Project.Project[]; errors: Error[] } {
  const projectsMap =
    origin === undefined
      ? new Map<Project.Id, Project.Project>()
      : new Map<Project.Id, Project.Project>(origin);
  const errors: Error[] = [];
  for (const event of events) {
    if (!event.type.startsWith("project_")) {
      continue;
    }

    const result = applyProjectEvent(ctx, projectsMap, event);
    if (Result.isErr(result)) {
      errors.push(result);
    } else {
      result.log.push(newTraceEvent(result, event));
      projectsMap.set(result.id, result);
    }
  }
  const projects = [...projectsMap.values()];
  return { projects, errors };
}

function applyProjectEvent(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  event: BusinessEvent,
): Result.Type<Project.Project> {
  switch (event.type) {
    case "project_created":
      return ProjectCreated.createFrom(ctx, event);

    case "project_updated":
      return apply(ctx, event, projects, event.projectId, ProjectUpdated);

    case "project_assigned":
      return apply(ctx, event, projects, event.projectId, ProjectAssigned);

    case "project_closed":
      return apply(ctx, event, projects, event.projectId, ProjectClosed);

    case "project_permission_granted":
      return apply(ctx, event, projects, event.projectId, ProjectPermissionGranted);

    case "project_permission_revoked":
      return apply(ctx, event, projects, event.projectId, ProjectPermissionRevoked);

    case "project_projected_budget_updated":
      return apply(ctx, event, projects, event.projectId, ProjectProjectedBudgetUpdated);

    case "project_projected_budget_deleted":
      return apply(ctx, event, projects, event.projectId, ProjectProjectedBudgetDeleted);

    default:
      throw Error(`not implemented: ${event.type}`);
  }
}

function newTraceEvent(project: Project.Project, event: BusinessEvent): ProjectTraceEvent {
  return {
    entityId: project.id,
    entityType: "project",
    businessEvent: event,
    snapshot: {
      displayName: project.displayName,
    },
  };
}

type ApplyFn = (
  ctx: Ctx,
  event: BusinessEvent,
  project: Project.Project,
) => Result.Type<Project.Project>;
function apply(
  ctx: Ctx,
  event: BusinessEvent,
  projects: Map<Project.Id, Project.Project>,
  projectId: string,
  eventModule: { apply: ApplyFn },
) {
  const project = projects.get(projectId);
  if (project === undefined) {
    return new EventSourcingError({ ctx, event, target: { projectId } }, "not found");
  }

  try {
    return produce(project, draft => {
      const result = eventModule.apply(ctx, event, draft);
      if (Result.isErr(result)) {
        throw result;
      }
      return result;
    });
  } catch (err) {
    return err;
  }
}
