import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import * as Permission from "./model/Permission";

const globalstreamName = "global";

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
    await Permission.publish(multichain, globalstreamName, args);
  }
};

export const getPermissions = async (
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
      // Happens at startup, no need to worry..
      return {};
    } else {
      throw err;
    }
  }
};

export const grantPermission = async (
  multichain: MultichainClient,
  identity: string,
  intent: Intent,
): Promise<void> => {
  await ensureStreamExists(multichain);
  const permissions = await getPermissions(multichain);
  const permissionsForIntent: People = permissions[intent] || [];
  if (permissionsForIntent.includes(identity)) {
    // The given user is already permitted to execute the given intent.
    return;
  }
  permissionsForIntent.push(identity);
  permissions[intent] = permissionsForIntent;
  const args = {
    intent: "global.grantPermission" as Intent,
    createdBy: identity,
    creationTimestamp: new Date(),
    data: { permissions },
    dataVersion: 1, // integer
  };
  await Permission.publish(multichain, globalstreamName, args);
};

export const revokePermission = async (
  multichain: MultichainClient,
  identity: string,
  intent: Intent,
): Promise<void> => {
  let permissions;
  try {
    permissions = await getPermissions(multichain);
  } catch (err) {
    if (err.kind === "NotFound") {
      // No permissions set yet, so nothing to revoke.
      return;
    } else {
      throw err;
    }
  }
  const permissionsForIntent: People = permissions[intent] || [];

  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex === -1) {
    // The given user has no permissions to execute the given intent.
    // Note: a user could still belong to a group that has access rights!
    return;
  }
  // Remove the user from the array:
  permissionsForIntent.splice(userIndex, 1);

  permissions[intent] = permissionsForIntent;
  const args = {
    intent: "global.revokePermission" as Intent,
    createdBy: identity,
    creationTimestamp: new Date(),
    data: { permissions },
    dataVersion: 1, // integer
  };
  await Permission.publish(multichain, globalstreamName, args);
};
