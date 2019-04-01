import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { canAssumeIdentity } from "../organization/auth_token";
import { ServiceUser } from "../organization/service_user";
import * as Subproject from "./subproject";
import { SubprojectTraceEvent } from "./subproject_trace_event";

interface Repository {
  getSubproject(): Promise<Result.Type<Subproject.Subproject>>;
}

export async function getSubproject(
  ctx: Ctx,
  user: ServiceUser,
  subprojectId: string,
  repository: Repository,
): Promise<Result.Type<Subproject.Subproject>> {
  const subprojectResult = await repository.getSubproject();

  if (Result.isErr(subprojectResult)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }
  const subproject = subprojectResult;

  if (user.id !== "root") {
    const intents: Intent[] = ["subproject.viewSummary", "subproject.viewDetails"];
    if (!Subproject.permits(subproject, user, intents)) {
      return new NotAuthorized(ctx, user.id, intents, subproject);
    }
  }

  return dropHiddenHistoryEvents(subproject, user);
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
  ["subproject_projected_budget_updated", ["subproject.viewDetails"]],
  ["subproject_projected_budget_deleted", ["subproject.viewDetails"]],
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
