import { VError } from "verror";
import Intent, { globalIntents } from "../../../authz/intents";
import * as Result from "../../../result";
import { Permissions } from "../permissions";
import { GlobalPermissions, identitiesAuthorizedFor } from "../workflow/global_permissions";
import { Identity } from "./identity";
import { ServiceUser } from "./service_user";
import * as UserRecord from "./user_record";

export interface AuthToken {
  userId: UserRecord.Id;
  displayName: string;
  address: string;
  groups: string[];
  organization: string;
  organizationAddress: string;
  allowedIntents: Intent[];
}

export function canAssumeIdentity(
  user: { id: string; groups: string[] },
  identity: Identity,
): boolean {
  // TODO support groups in groups (which makes this function async)
  return identity === user.id || user.groups.includes(identity) || user.id === "root";
}

interface Repository {
  getGroupsForUser(userId: UserRecord.Id): Promise<Result.Type<string[]>>;
  getOrganizationAddress(organization: string): Promise<Result.Type<string>>;
  getGlobalPermissions(): Promise<Result.Type<GlobalPermissions>>;
}

export async function fromUserRecord(
  user: UserRecord.UserRecord,
  repository: Repository,
): Promise<Result.Type<AuthToken>> {
  const groupsResult = await repository.getGroupsForUser(user.id);
  if (Result.isErr(groupsResult)) {
    return new VError(groupsResult, `fetch groups for user ${user.id} failed`);
  }
  const groups = groupsResult;

  const organizationAddressResult = await repository.getOrganizationAddress(user.organization);
  if (Result.isErr(organizationAddressResult)) {
    return new VError(organizationAddressResult, "get organization address failed");
  }
  const organizationAddress = organizationAddressResult;
  const globalPermissionsResult = await repository.getGlobalPermissions();
  if (Result.isErr(globalPermissionsResult)) {
    return new VError(globalPermissionsResult, "get global permissions failed");
  }
  const globalPermissions = globalPermissionsResult;
  const allowedIntents = globalIntents.filter((intent) => {
    const eligibleIdentities = identitiesAuthorizedFor(globalPermissions, intent);
    return eligibleIdentities.some((identity) =>
      canAssumeIdentity({ id: user.id, groups }, identity),
    );
  });
  return {
    userId: user.id,
    displayName: user.displayName,
    address: user.address,
    groups,
    organization: user.organization,
    organizationAddress,
    allowedIntents,
  };
}

export function permits(
  permissions: Permissions,
  actingUser: ServiceUser,
  intents: Intent[],
): boolean {
  const eligibleIdentities: Identity[] = intents.reduce((acc: Identity[], intent: Intent) => {
    const eligibles = permissions[intent] || [];
    return acc.concat(eligibles);
  }, []);
  const hasPermission = eligibleIdentities.some((identity) =>
    canAssumeIdentity(actingUser, identity),
  );
  return hasPermission;
}
