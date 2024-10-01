import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";

import * as Subproject from "./subproject";
import { SubprojectTraceEvent } from "./subproject_trace_event";

interface Repository {
  getAllSubprojects(): Promise<Result.Type<Subproject.Subproject[]>>;
}

export async function getAllVisible(
  _ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Result.Type<Subproject.Subproject[]>> {
  const allSubprojectsResult = await repository.getAllSubprojects();

  if (Result.isErr(allSubprojectsResult)) {
    return new VError(allSubprojectsResult, "couldn't get all subprojects");
  }
  const allSubprojects = allSubprojectsResult;

  logger.trace({ user }, "Checking user autorization");
  const isVisible =
    user.id === "root"
      ? (): boolean => true
      : (subproject: Subproject.Subproject): boolean =>
          Subproject.permits(subproject, user, ["subproject.list", "subproject.viewDetails"]);

  const removeNonvisibleHistory = (subproject: Subproject.Subproject): Subproject.Subproject =>
    dropHiddenHistoryEvents(subproject, user);

  const visibleSubprojects = allSubprojects.filter(isVisible).map(removeNonvisibleHistory);
  return visibleSubprojects;
}

type EventType = string;
const requiredPermissions = new Map<EventType, Intent[]>([
  ["subproject_created", ["subproject.list", "subproject.viewDetails"]],
  ["subproject_permission_granted", ["subproject.intent.listPermissions"]],
  ["subproject_permission_revoked", ["subproject.intent.listPermissions"]],
  ["subproject_assigned", ["subproject.viewDetails"]],
  ["subproject_updated", ["subproject.viewDetails"]],
  ["subproject_closed", ["subproject.list", "subproject.viewDetails"]],
  ["subproject_projected_budget_updated", ["subproject.viewDetails"]],
  ["subproject_projected_budget_deleted", ["subproject.viewDetails"]],
  ["workflowitems_reordered", ["subproject.reorderWorkflowitems"]],
]);

function dropHiddenHistoryEvents(
  subproject: Subproject.Subproject,
  actingUser: ServiceUser,
): Subproject.Subproject {
  const isEventVisible =
    actingUser.id === "root"
      ? (): boolean => true
      : (event: SubprojectTraceEvent): boolean => {
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
