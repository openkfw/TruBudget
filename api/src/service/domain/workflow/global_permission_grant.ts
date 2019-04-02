import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as GlobalPermissionGranted from "./global_permission_granted";
import * as GlobalPermissions from "./global_permissions";
import { sourceProjects } from "./project_eventsourcing";

interface Repository {
  getGlobalPermissions(): Promise<GlobalPermissions.GlobalPermissions>;
}

export async function grantGlobalPermission(
  ctx: Ctx,
  issuer: ServiceUser,
  grantee: Identity,
  intent: Intent,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  // Create the new event:
  const globalPermissionGranted = GlobalPermissionGranted.createEvent(
    ctx.source,
    issuer.id,
    intent,
    grantee,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const grantIntent = "global.grantPermission";
    const currentGlobalPermissions = await repository.getGlobalPermissions();
    if (!GlobalPermissions.permits(currentGlobalPermissions, issuer, [grantIntent])) {
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, issuer.id, grantIntent, currentGlobalPermissions)],
      };
    }
  }

  // Check that the new event is indeed valid:
  const { errors } = sourceProjects(ctx, [globalPermissionGranted]);
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, globalPermissionGranted, errors)] };
  }

  return { newEvents: [globalPermissionGranted], errors: [] };
}
