import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";
import { ignoringStreamNotFound } from "../lib";

const globalstreamName = "global";
const permissionsKey = "permissions";

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "global",
    name: globalstreamName
  });
};

export const getPermissions = async (
  multichain: MultichainClient
): Promise<AllowedUserGroupsByIntent> => {
  const permissions = (await ignoringStreamNotFound(
    multichain.getValues(globalstreamName, permissionsKey, 1)
  )) as AllowedUserGroupsByIntent[] | null;
  if (permissions !== null && permissions.length > 0) {
    return permissions[0];
  } else {
    return {};
  }
};

export const replacePermissions = async (
  multichain: MultichainClient,
  permissionsByIntent: AllowedUserGroupsByIntent
): Promise<void> => {
  await ensureStreamExists(multichain);
  return multichain.setValue(globalstreamName, permissionsKey, permissionsByIntent);
};
