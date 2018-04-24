import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";
import { ignoringStreamNotFound } from "../multichain/lib";
import { MultichainClient } from "../multichain";

const usersStreamName = "users";

export interface UserRecord {
  id: string;
  displayName: string;
  organization: string;
  passwordCiphertext: string;
}

export interface UserWithoutPassword {
  id: string;
  displayName: string;
  organization: string;
}

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "users",
    name: usersStreamName
  });
};

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  user: UserRecord
): Promise<void> => {
  await ensureStreamExists(multichain);

  // Don't overwrite existing users:
  const userExists = (await multichain.getValues(usersStreamName, user.id, 1)).length !== 0;
  if (userExists) throw { kind: "UserAlreadyExists", targetUserId: user.id };

  await Promise.all([
    multichain.setValue(usersStreamName, user.id, user),
    multichain.setValue(usersStreamName, "log", { issuer: token.userId, action: "user_created" })
  ]);
};

export const get = async (multichain: MultichainClient, userId: string): Promise<UserRecord> => {
  const result = await ignoringStreamNotFound(multichain.getValues(usersStreamName, userId, 1));
  if (result.length === 0) {
    throw { kind: "NotFound", what: `User with ID ${userId}` };
  } else {
    return result[0];
  }
};

export const getAll = async (multichain: MultichainClient): Promise<UserRecord[]> => {
  const users = (await ignoringStreamNotFound(
    multichain.getValues(usersStreamName, "*")
  )) as UserRecord[];
  return users;
};
