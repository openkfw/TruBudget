import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";

const globalstreamName = "global";

export const getPermissions = async (
  multichain: MultichainClient
): Promise<AllowedUserGroupsByIntent> => {
  const permissions = (await multichain.getValues(
    globalstreamName,
    "permissions",
    1
  )) as AllowedUserGroupsByIntent[];
  if (!permissions.length) throw Error("no permissions on global stream");
  return permissions[0];
};
