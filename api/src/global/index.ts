import Intent, { userAssignableIntents } from "../authz/intents";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import logger from "../lib/logger";
import { MultichainClient } from "../multichain/Client.h";
import { Event } from "../multichain/event";
import { isAllowedToGrant, isAllowedToSee, publish } from "./Permission";
import { get, User } from "./User";

import * as Group from "../group";
import * as Permission from "./Permission";

export * from "./Permission";
export * from "./User";

const globalstreamName = "global";

export type PermissionsLister = () => Promise<Permission.Permissions>;

export type PermissionsGranter = (intent: Intent, grantee: string) => Promise<void>;

export type PermissionsRevoker = (intent: Intent, recipient: string) => Promise<void>;

export async function list(
  actingUser: User,
  { getAllPermissions }: { getAllPermissions: PermissionsLister },
): Promise<Permission.Permissions> {
  const allPermissions = await getAllPermissions();
  if (!isAllowedToSee(allPermissions, actingUser)) {
    return Promise.reject(Error(`Identity ${actingUser.id} is not allowed to list Permissions.`));
  }
  return allPermissions;
}

export async function grant(
  actingUser: User,
  grantee: string,
  intent: Intent,
  {
    getAllPermissions,
    grantPermission,
  }: { getAllPermissions: PermissionsLister; grantPermission: PermissionsGranter },
): Promise<void> {
  const allPermissions = await getAllPermissions();
  const permissionsForIntent: People = allPermissions[intent] || [];
  if (permissionsForIntent.includes(grantee)) {
    logger.debug(`${grantee} is already permitted to execute given intent.`);
    return;
  }
  if (!isAllowedToGrant(allPermissions, actingUser)) {
    return Promise.reject(Error(`Identity ${actingUser.id} is not allowed to grant Permissions.`));
  }
  await grantPermission(intent, grantee);
}

export async function grantAll(
  actingUser: User,
  grantee: string,
  {
    getAllPermissions,
    grantPermission,
  }: { getAllPermissions: PermissionsLister; grantPermission: PermissionsGranter },
) {
  const allPermissions = await getAllPermissions();
  if (!Permission.isAllowedToGrant(allPermissions, actingUser)) {
    return Promise.reject(Error(`Identity ${actingUser.id} is not allowed to grant Permissions.`));
  }
  let permissionsForIntent: People;
  for (const intent of userAssignableIntents) {
    permissionsForIntent = allPermissions[intent] || [];
    if (permissionsForIntent.includes(grantee)) {
      continue;
    }
    await grantPermission(intent, grantee);
  }
}

export async function revoke(
  actingUser: User,
  recipient: string,
  intent: Intent,
  {
    getAllPermissions,
    revokePermission,
  }: { getAllPermissions: PermissionsLister; revokePermission: PermissionsRevoker },
): Promise<void> {
  const allPermissions = await getAllPermissions();
  const permissionsForIntent: People = allPermissions[intent] || [];
  if (!permissionsForIntent.includes(recipient)) {
    logger.debug(
      { params: { intent } },
      "User has no permission to execute given intent, nothing has to be revoked",
    );
    return;
  }
  if (!Permission.isAllowedToRevoke(allPermissions, actingUser)) {
    return Promise.reject(Error(`Identity ${actingUser.id} is not allowed to revoke Permissions.`));
  }
  await revokePermission(intent, recipient);
}

// old implementations

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "global",
    name: globalstreamName,
  });
  const hasSelfItem = await multichain
    .v2_readStreamItems(globalstreamName, "self", 1)
    .then(items => items.length > 0);
  if (!hasSelfItem) {
    const permissions = {};
    const args = {
      intent: "global.grantPermission" as Intent,
      createdBy: "root",
      creationTimestamp: new Date(),
      data: { permissions },
      dataVersion: 1, // integer
    };
    await publish(multichain, globalstreamName, args);
  }
};

export const oldGetPermissions = async (
  multichain: MultichainClient,
): Promise<AllowedUserGroupsByIntent> => {
  try {
    const streamItems = await multichain.v2_readStreamItems(globalstreamName, "self", 1);
    if (streamItems.length < 1) {
      return {};
    }
    const event: Event = streamItems[0].data.json;
    return event.data.permissions;
  } catch (err) {
    if (err.kind === "NotFound") {
      // Happens at startup, no need to worry...
      logger.debug("Global permissions not found. Happens at startup.");
      return {};
    } else {
      logger.error({ error: err }, "Error while retrieving global permissions");
      throw err;
    }
  }
};

export const oldGrantPermission = async (
  multichain: MultichainClient,
  grantee: string,
  intent: Intent,
): Promise<void> => {
  await ensureStreamExists(multichain);
  const permissions = await oldGetPermissions(multichain);
  const permissionsForIntent: People = permissions[intent] || [];
  if (permissionsForIntent.includes(grantee)) {
    logger.debug({ params: { intent } }, "User is already permitted to execute given intent");
    return;
  }
  permissionsForIntent.push(grantee);
  permissions[intent] = permissionsForIntent;
  const args = {
    intent: "global.grantPermission" as Intent,
    createdBy: grantee,
    creationTimestamp: new Date(),
    data: { permissions },
    dataVersion: 1, // integer
  };
  await publish(multichain, globalstreamName, args);
};
export const oldRevokePermission = async (
  multichain: MultichainClient,
  identity: string,
  intent: Intent,
): Promise<void> => {
  let permissions;
  try {
    permissions = await oldGetPermissions(multichain);
  } catch (err) {
    if (err.kind === "NotFound") {
      logger.debug("No permission set, nothing to revoke");
      // No permissions set yet, so nothing to revoke.
      return;
    } else {
      logger.error({ error: err }, "An error occured while revoking permissions");
      throw err;
    }
  }
  const permissionsForIntent: People = permissions[intent] || [];

  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex === -1) {
    // The given user has no permissions to execute the given intent.
    // Note: a user could still belong to a group that has access rights!
    logger.warn(`User has no permissions to execute intent ${intent}`);
    return;
  }
  // Remove the user from the array:
  logger.info(`Revoking permissions for intent ${intent} of user ${identity}`);
  permissionsForIntent.splice(userIndex, 1);

  permissions[intent] = permissionsForIntent;
  const args = {
    intent: "global.revokePermission" as Intent,
    createdBy: identity,
    creationTimestamp: new Date(),
    data: { permissions },
    dataVersion: 1, // integer
  };
  await publish(multichain, globalstreamName, args);
};

export const identityExists = async (multichain, groupOrUserId) => {
  await ensureStreamExists(multichain);
  const existingGroups = await Group.getGroup(multichain, groupOrUserId);
  const groupIdExists = existingGroups ? true : false;
  const userIdExists = await get(multichain, groupOrUserId)
    .then(() => true)
    .catch(() => false);

  const exists = groupIdExists || userIdExists;

  logger.debug(`ID ${groupOrUserId} ${exists ? "exists." : "does not exist."}`);

  return exists ? true : false;
};
