import * as Global from ".";
import { throwIfUnauthorized } from "../authz";
import { userDefaultIntents } from "../authz/intents";
import Intent from "../authz/intents";
import { UserAlreadyExistsError } from "../error";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { encrypt } from "../lib/symmetricCrypto";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { createkeypairs } from "../multichain/createkeypairs";
import * as User from "../user/model/user";
import { hashPassword } from "../user/password";

export const createUser = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  jwtSecret: string,
  rootSecret: string,
  organizationVaultSecret: string,
): Promise<HttpResponse> => {
  const input = value("data.user", req.body.data.user, x => x !== undefined);

  const userId = value("id", input.id, isNonemptyString);
  const organization = value("organization", input.organization, isNonemptyString);
  const passwordDigest = await hashPassword(value("password", input.password, isNonemptyString));

  // Make sure nobody creates the special "root" user:
  if (userId === "root") {
    throw { kind: "UserAlreadyExists", targetUserId: "root" } as UserAlreadyExistsError;
  }

  // Is the user allowed to create new users?
  const userIntent: Intent = "global.createUser";
  await throwIfUnauthorized(req.user, userIntent, await Global.getPermissions(multichain));

  // Quick check (= no guarantee) that the user doesn't exist already (in case there's a
  // race and a user gets created more than once, only the first creation will actually
  // be effective and all others will be ignored):
  const userAlreadyExists = await User.get(multichain, userId)
    .then(() => true)
    .catch(() => false);
  if (userAlreadyExists) {
    throw { kind: "UserAlreadyExists", targetUserId: userId } as UserAlreadyExistsError;
  }

  // Every user gets her own address:
  const keyPair = await createkeypairs(multichain);

  const user: User.UserRecord = {
    id: userId,
    displayName: value("displayName", input.displayName, isNonemptyString),
    organization,
    address: keyPair.address,
    privkey: encrypt(organizationVaultSecret, keyPair.privkey),
    passwordDigest,
  };

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: user,
  };

  await User.publish(multichain, userId, event);
  logger.info({ user }, `User ${user.displayName} created. Granting permissions now...`);
  await grantInitialPermissions(multichain, user);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        user: User.publicRecord(user),
      },
    },
  ];
};

async function grantInitialPermissions(
  multichain: MultichainClient,
  user: User.UserRecord,
): Promise<void> {
  for (const intent of userDefaultIntents) {
    logger.info(
      { params: { userId: user.id, intent } },
      `Granting default permissions to ${user.id}`,
    );
    await Global.grantPermission(multichain, user.id, intent);
  }
}
