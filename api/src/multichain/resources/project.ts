import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";

const permissionsKey = "permissions";

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const permissions = (await multichain.getValues(
    projectId,
    permissionsKey,
    1
  )) as AllowedUserGroupsByIntent[];
  if (!permissions.length) throw Error(`no permissions on project stream ${projectId}`);
  return permissions[0];
};

export const replacePermissions = async (
  multichain: MultichainClient,
  projectId: string,
  permissionsByIntent: AllowedUserGroupsByIntent
): Promise<void> => {
  return multichain.setValue(projectId, permissionsKey, permissionsByIntent);
};
