import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as GlobalPermissionGranted from "./global_permission_granted";
import { GlobalPermissions, identitiesAuthorizedFor } from "./global_permissions";
import { sourceProjects } from "./project_eventsourcing";

interface Repository {
  getGlobalPermissions(): Promise<GlobalPermissions>;
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
    const currentGlobalPermissions = await repository.getGlobalPermissions();
    const isAuthorized = identitiesAuthorizedFor(
      currentGlobalPermissions,
      "global.grantPermission",
    ).some(identity => canAssumeIdentity(issuer, identity));
    if (!isAuthorized) {
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, issuer.id, globalPermissionGranted)],
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
