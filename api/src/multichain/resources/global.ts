import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";
import { ignoringStreamNotFound } from "../lib";

const globalstreamName = "global";

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "global",
    name: globalstreamName
  });
};

export const getPermissions = async (
  multichain: MultichainClient
): Promise<AllowedUserGroupsByIntent> => {
  try {
    const streamItem = await multichain.getValue(globalstreamName, "self");
    return streamItem.resource.permissions;
  } catch (err) {
    if (err.kind === "NotFound" && err.what === "stream global") {
      // Happens at startup, no need to worry..
      return {};
    } else {
      throw err;
    }
  }
};

export const replacePermissions = async (
  multichain: MultichainClient,
  permissionsByIntent: AllowedUserGroupsByIntent
): Promise<void> => {
  await ensureStreamExists(multichain);

  let self: Resource = await multichain
    .getValue(globalstreamName, "self")
    .then(x => x.resource)
    .catch(err => {
      if (err.kind === "NotFound") {
        return { data: {}, log: [], permissions: {} };
      } else {
        throw err;
      }
    });

  self.permissions = permissionsByIntent;

  return multichain.setValue(globalstreamName, ["self"], self);
};
