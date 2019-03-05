import Intent, { globalIntents } from "../../../authz/intents";
import { GlobalPermissions, identitiesAuthorizedFor } from "../workflow/global_permissions";
import { Identity } from "./identity";
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
  return identity === user.id || user.groups.includes(identity) || user.id === "root";
}

interface Repository {
  getGroupsForUser(userId: UserRecord.Id): Promise<string[]>;
  getOrganizationAddress(organization: string): Promise<string>;
  getGlobalPermissions(): Promise<GlobalPermissions>;
}

export async function fromUserRecord(
  user: UserRecord.UserRecord,
  repository: Repository,
): Promise<AuthToken> {
  const groups = await repository.getGroupsForUser(user.id);
  const organizationAddress = await repository.getOrganizationAddress(user.organization);
  const globalPermissions = await repository.getGlobalPermissions();
  const allowedIntents = globalIntents.filter(intent => {
    const eligibleIdentities = identitiesAuthorizedFor(globalPermissions, intent);
    return eligibleIdentities.some(identity =>
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
