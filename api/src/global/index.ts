import { MultichainClient } from "../multichain";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import Intent from "../authz/intents";
import { Resource } from "../multichain/Client.h";

const globalstreamName = "global";

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "global",
    name: globalstreamName,
  });
  // TODO this is racy -- Global needs to be event-source like the other streams!
  const hasSelfItem = await multichain
    .v2_readStreamItems("global", "self")
    .then(items => items.length > 0);
  if (!hasSelfItem) {
    const emptyResource: Resource = { data: {}, log: [], permissions: {} };
    await multichain.setValue(globalstreamName, ["self"], emptyResource);
  }
};

export const getPermissions = async (
  multichain: MultichainClient,
): Promise<AllowedUserGroupsByIntent> => {
  try {
    const streamItem = await multichain.getValue(globalstreamName, "self");
    return streamItem.resource.permissions;
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
  const streamItem = await multichain.getValue(globalstreamName, "self");
  const globalResource = streamItem.resource;
  const permissionsForIntent: People = globalResource.permissions[intent] || [];

  if (permissionsForIntent.includes(identity)) {
    // The given user is already permitted to execute the given intent.
    return;
  }
  permissionsForIntent.push(identity);

  globalResource.permissions[intent] = permissionsForIntent;
  await multichain.setValue(globalstreamName, streamItem.key, globalResource);
};

export const revokePermission = async (
  multichain: MultichainClient,
  identity: string,
  intent: Intent,
): Promise<void> => {
  let streamItem;
  try {
    streamItem = await multichain.getValue(globalstreamName, "self");
  } catch (err) {
    if (err.kind === "NotFound") {
      // No permissions set yet, so nothing to revoke.
      return;
    } else {
      throw err;
    }
  }
  const globalResource = streamItem.resource;
  const permissionsForIntent: People = globalResource.permissions[intent] || [];

  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex === -1) {
    // The given user has no permissions to execute the given intent.
    // Note: a user could still belong to a group that has access rights!
    return;
  }
  // Remove the user from the array:
  permissionsForIntent.splice(userIndex, 1);

  globalResource.permissions[intent] = permissionsForIntent;
  await multichain.setValue(globalstreamName, streamItem.key, globalResource);
};
