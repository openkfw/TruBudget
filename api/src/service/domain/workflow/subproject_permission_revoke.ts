import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as SubprojectPermissionRevoked from "./subproject_permission_revoked";

interface Repository {
  getSubproject(subprojectId: Subproject.Id): Promise<Result.Type<Subproject.Subproject>>;
}

export async function revokeSubprojectPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  revokee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const subproject = await repository.getSubproject(subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  // Create the new event:
  const permissionRevoked = SubprojectPermissionRevoked.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    intent,
    revokee,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Subproject.permits(subproject, issuer, ["project.intent.revokePermission"])) {
      return new NotAuthorized(ctx, issuer.id, permissionRevoked);
    }
  }

  // Check that the new event is indeed valid:
  const next = SubprojectPermissionRevoked.apply(ctx, permissionRevoked, subproject);
  if (Result.isErr(next)) {
    return new InvalidCommand(ctx, permissionRevoked, [next]);
  }

  return { newEvents: [permissionRevoked] };
}
