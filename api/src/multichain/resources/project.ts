import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";
import { ignoringStreamNotFound } from "../lib";

const permissionsKey = "permissions";

const ensureStreamExists = async (
  multichain: MultichainClient,
  projectId: string
): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "global",
    name: projectId
  });
};

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const permissions = (await ignoringStreamNotFound(
    multichain.getValues(projectId, permissionsKey, 1)
  )) as AllowedUserGroupsByIntent[] | null;
  if (permissions !== null && permissions.length > 0) {
    return permissions[0];
  } else {
    return {};
  }
};

export const replacePermissions = async (
  multichain: MultichainClient,
  projectId: string,
  permissionsByIntent: AllowedUserGroupsByIntent
): Promise<void> => {
  await ensureStreamExists(multichain, projectId);
  return multichain.setValue(projectId, permissionsKey, permissionsByIntent);
};
