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
import { ProjectTraceEvent } from "./project_trace_event";
import * as ProjectUpdated from "./project_updated";

export function sourceProjects(
  ctx: Ctx,
  events: BusinessEvent[],
): { projects: Project.Project[]; errors: EventSourcingError[] } {
  const projects = new Map<Project.Id, Project.Project>();
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, projects, event, errors);
  }
  return { projects: [...projects.values()], errors };
}

function apply(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
  if (event.type === "project_created") {
    handleCreate(ctx, projects, event, errors);
  } else if (event.type === "project_updated") {
    applyUpdate(ctx, projects, event, errors);
  } else if (event.type === "project_assigned") {
    applyAssign(ctx, projects, event, errors);
  } else if (event.type === "project_closed") {
    applyClose(ctx, projects, event, errors);
  } else if (event.type === "project_permission_granted") {
    applyGrantPermission(ctx, projects, event, errors);
  } else if (event.type === "project_permission_revoked") {
    applyRevokePermission(ctx, projects, event, errors);
  }
}

function handleCreate(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  projectCreated: ProjectCreated.Event,
  errors: EventSourcingError[],
) {
  const initialData = projectCreated.project;

  let project = projects.get(initialData.id);
  if (project !== undefined) return;

  project = {
    id: initialData.id,
    createdAt: projectCreated.time,
    status: initialData.status,
    displayName: initialData.displayName,
    description: initialData.description,
    assignee: initialData.assignee,
    thumbnail: initialData.thumbnail,
    projectedBudgets: initialData.projectedBudgets,
    permissions: initialData.permissions,
    log: [],
    additionalData: initialData.additionalData,
  };

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, projectCreated, result.message));
    return;
  }

  const traceEvent: ProjectTraceEvent = {
    entityId: initialData.id,
    entityType: "project",
    businessEvent: projectCreated,
    snapshot: {
      displayName: project.displayName,
    },
  };
  project.log.push(traceEvent);

  projects.set(initialData.id, project);
}

function applyUpdate(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  projectUpdated: ProjectUpdated.Event,
  errors: EventSourcingError[],
) {
  const project = deepcopy(projects.get(projectUpdated.projectId));
  if (project === undefined) return;

  const update = projectUpdated.update;
  if (update.displayName !== undefined) {
    project.displayName = update.displayName;
  }
  if (update.description !== undefined) {
    project.description = update.description;
  }
  if (update.thumbnail !== undefined) {
    project.thumbnail = update.thumbnail;
  }

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, projectUpdated, result.message));
    return;
  }

  const traceEvent: ProjectTraceEvent = {
    entityId: projectUpdated.projectId,
    entityType: "project",
    businessEvent: projectUpdated,
    snapshot: {
      displayName: project.displayName,
    },
  };
  project.log.push(traceEvent);

  projects.set(projectUpdated.projectId, project);
}

function applyAssign(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  projectAssigned: ProjectAssigned.Event,
  errors: EventSourcingError[],
) {
  const project = deepcopy(projects.get(projectAssigned.projectId));
  if (project === undefined) return;

  project.assignee = projectAssigned.assignee;

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, projectAssigned, result.message));
    return;
  }

  const traceEvent: ProjectTraceEvent = {
    entityId: projectAssigned.projectId,
    entityType: "project",
    businessEvent: projectAssigned,
    snapshot: {
      displayName: project.displayName,
    },
  };
  project.log.push(traceEvent);

  projects.set(projectAssigned.projectId, project);
}

function applyClose(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  projectClosed: ProjectClosed.Event,
  errors: EventSourcingError[],
) {
  const project = deepcopy(projects.get(projectClosed.projectId));
  if (project === undefined) return;

  project.status = "closed";

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, projectClosed, result.message));
    return;
  }

  const traceEvent: ProjectTraceEvent = {
    entityId: projectClosed.projectId,
    entityType: "project",
    businessEvent: projectClosed,
    snapshot: {
      displayName: project.displayName,
    },
  };
  project.log.push(traceEvent);

  projects.set(projectClosed.projectId, project);
}

function applyGrantPermission(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  permissionGranted: ProjectPermissionGranted.Event,
  errors: EventSourcingError[],
) {
  const project = deepcopy(projects.get(permissionGranted.projectId));
  if (project === undefined) return;

  const eligibleIdentities = project.permissions[permissionGranted.permission] || [];
  if (!eligibleIdentities.includes(permissionGranted.grantee)) {
    eligibleIdentities.push(permissionGranted.grantee);
  }
  project.permissions[permissionGranted.permission] = eligibleIdentities;

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, permissionGranted, result.message));
    return;
  }

  const traceEvent: ProjectTraceEvent = {
    entityId: permissionGranted.projectId,
    entityType: "project",
    businessEvent: permissionGranted,
    snapshot: {
      displayName: project.displayName,
    },
  };
  project.log.push(traceEvent);

  projects.set(permissionGranted.projectId, project);
}

function applyRevokePermission(
  ctx: Ctx,
  projects: Map<Project.Id, Project.Project>,
  permissionRevoked: ProjectPermissionRevoked.Event,
  errors: EventSourcingError[],
) {
  const project = deepcopy(projects.get(permissionRevoked.projectId));
  if (project === undefined) return;

  const eligibleIdentities = project.permissions[permissionRevoked.permission];
  if (eligibleIdentities !== undefined) {
    const foundIndex = eligibleIdentities.indexOf(permissionRevoked.revokee);
    const hasPermission = foundIndex !== -1;
    if (hasPermission) {
      // Remove the user from the array:
      eligibleIdentities.splice(foundIndex, 1);
    }
  }

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, permissionRevoked, result.message));
    return;
  }

  const traceEvent: ProjectTraceEvent = {
    entityId: permissionRevoked.projectId,
    entityType: "project",
    businessEvent: permissionRevoked,
    snapshot: {
      displayName: project.displayName,
    },
  };
  project.log.push(traceEvent);

  projects.set(permissionRevoked.projectId, project);
}
