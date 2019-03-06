import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Subproject from "./subproject";
import { sourceSubprojects } from "./subproject_eventsourcing";
import { SubprojectTraceEvent } from "./subproject_trace_event";

interface Repository {
  getAllSubprojectEvents(): Promise<BusinessEvent[]>;
}

export async function getAllVisible(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Subproject.Subproject[]> {
  const allSubprojectsEvents = await repository.getAllSubprojectEvents();
  const { subprojects: allSubprojects } = sourceSubprojects(ctx, allSubprojectsEvents);

  const isVisible =
    user.id === "root"
      ? () => true
      : (subproject: Subproject.Subproject) =>
          Subproject.permits(subproject, user, [
            "subproject.viewSummary",
            "subproject.viewDetails",
          ]);

  const removeNonvisibleHistory = (subproject: Subproject.Subproject) =>
    dropHiddenHistoryEvents(subproject, user);

  const visibleSubprojects = allSubprojects.filter(isVisible).map(removeNonvisibleHistory);
  return visibleSubprojects;
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["subproject_created", ["subproject.viewSummary", "subproject.viewDetails"]],
  ["subproject_permission_granted", ["subproject.intent.listPermissions"]],
  ["subproject_permission_revoked", ["subproject.intent.listPermissions"]],
  ["subproject_assigned", ["subproject.viewDetails"]],
  ["subproject_updated", ["subproject.viewDetails"]],
  ["subproject_closed", ["subproject.viewSummary", "subproject.viewDetails"]],
  ["subproject_archived", ["subproject.viewSummary", "subproject.viewDetails"]],
]);

function dropHiddenHistoryEvents(
  subproject: Subproject.Subproject,
  actingUser: ServiceUser,
): Subproject.Subproject {
  const isEventVisible =
    actingUser.id === "root"
      ? () => true
      : (event: SubprojectTraceEvent) => {
          const allowed = requiredPermissions.get(event.businessEvent.type);
          if (!allowed) return false;
          for (const intent of allowed) {
            for (const identity of subproject.permissions[intent] || []) {
              if (canAssumeIdentity(actingUser, identity)) return true;
            }
          }
          return false;
        };

  return {
    ...subproject,
    log: (subproject.log || []).filter(isEventVisible),
  };
}
