import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
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
  const projects =
    origin === undefined
      ? new Map<Project.Id, Project.Project>()
      : new Map<Project.Id, Project.Project>(origin);
  const errors: Error[] = [];

  for (const event of events) {
    if (!event.type.startsWith("project_")) {
      continue;
    }

    const project = sourceEvent(ctx, event, projects);
    if (Result.isErr(project)) {
      errors.push(project);
    } else {
      project.log.push(newTraceEvent(project, event));
      projects.set(project.id, project);
    }
  }

  return { projects: [...projects.values()], errors };
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

function sourceEvent(
  ctx: Ctx,
  event: BusinessEvent,
  projects: Map<Project.Id, Project.Project>,
): Result.Type<Project.Project> {
  const projectId = getProjectId(event);
  let project: Result.Type<Project.Project>;
  if (Result.isOk(projectId)) {
    // The event refers to an existing project, so
    // the project should have been initialized already.

    project = get(projects, projectId);
    if (Result.isErr(project)) {
      return new VError(`project ID ${projectId} found in event ${event.type} is invalid`);
    }

    project = newProjectFromEvent(ctx, project, event);
    if (Result.isErr(project)) {
      return project; // <- event-sourcing error
    }
  } else {
    // The event does not refer to a project ID, so it must be a creation event:
    if (event.type !== "project_created") {
      return new VError(
        `event ${event.type} is not of type "project_created" but also ` +
          "does not include a project ID",
      );
    }

    project = ProjectCreated.createFrom(ctx, event);
    if (Result.isErr(project)) {
      return new VError(project, "could not create project from event");
    }
  }

  return project;
}

function get(
  projects: Map<Project.Id, Project.Project>,
  projectId: Project.Id,
): Result.Type<Project.Project> {
  const project = projects.get(projectId);
  if (project === undefined) {
    return new VError(`project ${projectId} not yet initialized`);
  }
  return project;
}

function getProjectId(event: BusinessEvent): Result.Type<Project.Id> {
  switch (event.type) {
    case "project_updated":
    case "project_assigned":
    case "project_closed":
    case "project_permission_granted":
    case "project_permission_revoked":
    case "project_projected_budget_updated":
    case "project_projected_budget_deleted":
      return event.projectId;

    default:
      return new VError(`cannot find project ID in event of type ${event.type}`);
  }
}

/** Returns a new project with the given event applied, or an error. */
export function newProjectFromEvent(
  ctx: Ctx,
  project: Project.Project,
  event: BusinessEvent,
): Result.Type<Project.Project> {
  const eventModule = getEventModule(event);
  if (Result.isErr(eventModule)) {
    return eventModule;
  }
  // Ensure that we never modify project or event in-place by passing copies. When
  // copying the project, its event log is omitted for performance reasons.
  const eventCopy = deepcopy(event);
  const projectCopy = copyProjectExceptLog(project);

  // Apply the event to the copied project:
  const mutationResult = eventModule.mutate(projectCopy, eventCopy);
  if (Result.isErr(mutationResult)) {
    return new EventSourcingError({ ctx, event, target: project }, mutationResult);
  }

  // Validate the modified project:
  const validationResult = Project.validate(projectCopy);
  if (Result.isErr(validationResult)) {
    return new EventSourcingError({ ctx, event, target: project }, validationResult);
  }

  // Restore the event log:
  projectCopy.log = project.log;

  // Return the modified (and validated) project:
  return projectCopy;
}

type EventModule = {
  mutate: (project: Project.Project, event: BusinessEvent) => Result.Type<void>;
};
function getEventModule(event: BusinessEvent): Result.Type<EventModule> {
  switch (event.type) {
    case "project_updated":
      return ProjectUpdated;

    case "project_assigned":
      return ProjectAssigned;

    case "project_closed":
      return ProjectClosed;

    case "project_permission_granted":
      return ProjectPermissionGranted;

    case "project_permission_revoked":
      return ProjectPermissionRevoked;

    case "project_projected_budget_updated":
      return ProjectProjectedBudgetUpdated;

    case "project_projected_budget_deleted":
      return ProjectProjectedBudgetDeleted;

    default:
      return new VError(`unknown project event ${event.type}`);
  }
}

function copyProjectExceptLog(project: Project.Project): Project.Project {
  const { log, ...tmp } = project;
  const copy = deepcopy(tmp);
  (copy as any).log = [];
  return copy as Project.Project;
}
