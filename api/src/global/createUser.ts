import * as Global from ".";
import { throwIfUnauthorized } from "../authz/index";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import logger from "../lib/logger";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { createkeypairs } from "../multichain/createkeypairs";
import { setPrivKey } from "../organization/vault";
import * as User from "../user";
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
  if (userId === "root") throw { kind: "UserAlreadyExists", targetUserId: "root" };

  // Is the user allowed to create new users?
  await throwIfUnauthorized(
    req.token,
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

  await User.create(multichain, req.token, newUser);
  logger.info(newUser, "User created.");

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
