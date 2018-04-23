import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const permissions = (await multichain.getValues(
    projectId,
    "permissions",
    1
  )) as AllowedUserGroupsByIntent[];
  if (!permissions.length) throw Error(`no permissions on project stream ${projectId}`);
  return permissions[0];
};
