import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";
import { ignoringStreamNotFound } from "../lib";

const ensureStreamExists = async (
  multichain: MultichainClient,
  projectId: string
): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "project",
    name: projectId
  });
};

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const streamItem = await multichain.getValue(projectId, "self");
  return streamItem.resource.permissions;
};

export const replacePermissions = async (
  multichain: MultichainClient,
  projectId: string,
  permissionsByIntent: AllowedUserGroupsByIntent
): Promise<void> => {
  await ensureStreamExists(multichain, projectId);

  let self: Resource = await multichain
    .getValue(projectId, "self")
    .then(x => x.resource)
    .catch(err => {
      if (err.kind === "NotFound") {
        return { data: {}, log: [], permissions: {} };
      } else {
        throw err;
      }
    });

  self.permissions = permissionsByIntent;

  return multichain.setValue(projectId, ["self"], self);
};
