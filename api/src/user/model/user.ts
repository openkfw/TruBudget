import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import * as Global from "../../global";
import { MultichainClient } from "../../multichain";
import { Resource } from "../../multichain/Client.h";

const usersStreamName = "users";

export interface UserResource extends Resource {
  data: UserRecord;
}

export interface UserRecord {
  id: string;
  displayName: string;
  organization: string;
  address: string;
  passwordDigest: string;
}

export interface UserWithoutPassword {
  id: string;
  displayName: string;
  organization: string;
  address: string;
}

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "users",
    name: usersStreamName,
  });
};

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  user: UserRecord,
): Promise<void> => {
  await ensureStreamExists(multichain);

  // Don't overwrite existing users:
  const userExists = (await multichain.getValues(usersStreamName, user.id, 1)).length !== 0;
  if (userExists) throw { kind: "UserAlreadyExists", targetUserId: user.id };

  const resource = {
    data: user,
    log: [{ issuer: token.userId, action: "user_created" }],
    permissions: {},
  };

  await multichain.setValue(usersStreamName, ["users", user.id], resource);
};

export const get = async (multichain: MultichainClient, userId: string): Promise<UserRecord> => {
  const streamItem = await multichain.getValue(usersStreamName, userId);
  return streamItem.resource.data;
};

export const getAll = async (multichain: MultichainClient): Promise<UserRecord[]> => {
  const streamItems = await multichain.getLatestValues(usersStreamName, "users");
  return streamItems.map(item => item.resource.data);
};

export async function publish(
  multichain: MultichainClient,
  identity: string,
  args: {
    intent: "user.intent.grantPermission" | "user.intent.revokePermission";
    createdBy: string;
    creationTimestamp: Date;
    dataVersion: number; // integer
    data: object;
  },
): Promise<void> {
  // TODO(kevin): As long as we're not using event sourcing for users, we're relying on
  // the Global permissions objects here. But this is clearly not ideal and should be
  // handled similar to how it's done in the project/subproject/workflowitem models
  // instead.
  if (args.dataVersion !== 1) throw Error(`cannot handle data version ${args.dataVersion}`);
  const eventData = args.data as { identity: string; intent: Intent };
  if (args.intent === "user.intent.grantPermission") {
    await Global.grantPermission(multichain, eventData.identity, eventData.intent);
  } else if (args.intent === "user.intent.revokePermission") {
    await Global.revokePermission(multichain, eventData.identity, eventData.intent);
  } else {
    throw Error(`illegal intent: ${args.intent}`);
  }
}

export async function getPermissions(multichain: MultichainClient, _userId: string) {
  // TODO(kevin): As long as we're not using event sourcing for users, we're relying on
  // the Global permissions objects here. But this is clearly not ideal and should be
  // handled similar to how it's done in the project/subproject/workflowitem models
  // instead.
  return Global.getPermissions(multichain);
}
