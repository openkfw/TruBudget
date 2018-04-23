import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";

const globalstreamName = "global";
const permissionsKey = "permissions";

export const getPermissions = async (
  multichain: MultichainClient
): Promise<AllowedUserGroupsByIntent> => {
  const permissions = (await multichain.getValues(
    globalstreamName,
    permissionsKey,
    1
  )) as AllowedUserGroupsByIntent[];
  if (!permissions.length) throw Error("no permissions on global stream");
  return permissions[0];
};

export const replacePermissions = async (
  multichain: MultichainClient,
  permissionsByIntent: AllowedUserGroupsByIntent
): Promise<void> => {
  return multichain.setValue(globalstreamName, permissionsKey, permissionsByIntent);
};
