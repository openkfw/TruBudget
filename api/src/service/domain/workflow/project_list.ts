import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import Intent from "../../../authz/intents";
import * as Result from "../../../result";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { ProjectTraceEvent } from "./project_trace_event";

interface Repository {
  getAllProjects(): Promise<Project.Project[]>;
}

export async function getAllVisible(
  _ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Result.Type<Project.Project[]>> {
  const projects = await repository.getAllProjects();
  logger.trace({ user }, "Filtering projects visible to user");
  const isVisible =
    user.id === "root"
      ? (): boolean => true
      : (project: Project.Project): boolean =>
          Project.permits(project, user, ["project.list", "project.viewDetails"]);

  const removeNonvisibleHistory = (project: Project.Project): Project.Project =>
    dropHiddenHistoryEvents(project, user);

  const visibleProjects = projects.filter(isVisible).map(removeNonvisibleHistory);
  return visibleProjects;
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["project_created", ["project.list", "project.viewDetails"]],
  ["project_permission_granted", ["project.intent.listPermissions"]],
  ["project_permission_revoked", ["project.intent.listPermissions"]],
  ["project_assigned", ["project.viewDetails"]],
  ["project_updated", ["project.viewDetails"]],
  ["project_closed", ["project.list", "project.viewDetails"]],
  ["project_projected_budget_updated", ["project.viewDetails"]],
  ["project_projected_budget_deleted", ["project.viewDetails"]],
]);

export function dropHiddenHistoryEvents(
  project: Project.Project,
  actingUser: ServiceUser,
): Project.Project {
  const isEventVisible = getIsEventVisibleFunction(actingUser, project);

  return {
    ...project,
    log: (project.log || []).filter(isEventVisible),
  };
}

function getIsEventVisibleFunction(
  actingUser: ServiceUser,
  project: Project.Project,
): (event?: ProjectTraceEvent) => boolean {
  if (actingUser.id === "root") return () => true;

  return (event: ProjectTraceEvent) => {
    const allowed = requiredPermissions.get(event.businessEvent.type);
    if (!allowed) return false;

    for (const intent of allowed) {
      for (const identity of project.permissions[intent] || []) {
        if (canAssumeIdentity(actingUser, identity)) return true;
      }
    }
    return false;
  };
}
