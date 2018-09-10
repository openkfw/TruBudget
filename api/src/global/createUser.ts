import * as Global from ".";
import { throwIfUnauthorized } from "../authz";
import { userDefaultIntents } from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { createkeypairs } from "../multichain/createkeypairs";
import { setPrivKey } from "../organization/vault";
import * as User from "../user/model/user";
import { hashPassword } from "../user/password";

export const createUser = async (
  multichain: MultichainClient,
  req,
  jwtSecret: string,
  rootSecret: string,
  organizationVaultSecret: string,
): Promise<HttpResponse> => {
  const input = value("data.user", req.body.data.user, x => x !== undefined);

  const userId = value("id", input.id, isNonemptyString);
  const organization = value("organization", input.organization, isNonemptyString);
  const passwordDigest = await hashPassword(value("password", input.password, isNonemptyString));

  // Make sure nobody creates the special "root" user:
  if (userId === "root") throw { kind: "UserAlreadyExists", targetUserId: "root" };

  // Is the user allowed to create new users?
  console.log(req)
  await throwIfUnauthorized(
    req.user,
    "global.createUser",
    await Global.getPermissions(multichain),
  );

  // Every user gets her own address:
  const keyPair = await createkeypairs(multichain);
  await setPrivKey(
    multichain,
    organization,
    organizationVaultSecret,
    keyPair.address,
    keyPair.privkey,
  );

  const newUser: User.UserRecord = {
    id: userId,
    displayName: value("displayName", input.displayName, isNonemptyString),
    organization,
    address: keyPair.address,
    passwordDigest,
  };

  await User.create(multichain, req.user, newUser);
  logger.info(newUser, "User created.");

  await grantInitialPermissions(multichain, newUser);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        user: {
          id: newUser.id,
          displayName: newUser.displayName,
          organization: newUser.organization,
          address: newUser.address,
        },
      },
    },
  ];
};

async function grantInitialPermissions(
  multichain: MultichainClient,
  user: User.UserRecord,
): Promise<void> {
  for (const intent of userDefaultIntents) {
    logger.trace({ userId: user.id, intent }, "granting default permission");
    await Global.grantPermission(multichain, user.id, intent);
  }
}
