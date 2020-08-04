import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { sourceProjects } from "./project_eventsourcing";
import { ProjectTraceEvent } from "./project_trace_event";
import { VError } from "verror";
import * as Result from "../../../result";

interface Repository {
  getAllProjects(): Promise<Project.Project[]>;
}

export async function getAllVisible(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Result.Type<Project.Project[]>> {
  const allProjects = await repository.getAllProjects();

  const isVisible =
    user.id === "root"
      ? () => true
      : (project: Project.Project) =>
          Project.permits(project, user, ["project.viewSummary", "project.viewDetails"]);

  const removeNonvisibleHistory = (project: Project.Project) =>
    dropHiddenHistoryEvents(project, user);

  const visibleProjects = allProjects.filter(isVisible).map(removeNonvisibleHistory);
  return visibleProjects;
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["project_created", ["project.viewSummary", "project.viewDetails"]],
  ["project_permission_granted", ["project.intent.listPermissions"]],
  ["project_permission_revoked", ["project.intent.listPermissions"]],
  ["project_assigned", ["project.viewDetails"]],
  ["project_updated", ["project.viewDetails"]],
  ["project_closed", ["project.viewSummary", "project.viewDetails"]],
  ["project_archived", ["project.viewSummary", "project.viewDetails"]],
  ["project_projected_budget_updated", ["project.viewDetails"]],
  ["project_projected_budget_deleted", ["project.viewDetails"]],
]);

function dropHiddenHistoryEvents(
  project: Project.Project,
  actingUser: ServiceUser,
): Project.Project {
  const isEventVisible =
    actingUser.id === "root"
      ? () => true
      : (event: ProjectTraceEvent) => {
          const allowed = requiredPermissions.get(event.businessEvent.type);
          if (!allowed) return false;
          for (const intent of allowed) {
            for (const identity of project.permissions[intent] || []) {
              if (canAssumeIdentity(actingUser, identity)) return true;
            }
          }
          return false;
        };

  return {
    ...project,
    log: (project.log || []).filter(isEventVisible),
  };
}
