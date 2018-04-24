import * as jsonwebtoken from "jsonwebtoken";

import * as User from "../user";
import { isNonemptyString } from "../lib";
import { HttpResponse, AuthenticatedRequest, throwParseError } from "../httpd/lib";
import { MultichainClient, GlobalOnChain } from "../multichain";
import { throwIfUnauthorized } from "../authz/index";
import { encryptPassword } from "../user/hash";

const value = (name, val, isValid) => {
  if (!isValid(val)) throwParseError([name]);
  return val;
};

export const createUser = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  jwtSecret: string,
  rootSecret: string
): Promise<HttpResponse> => {
  const input = value("body.user", req.body.user, x => x !== undefined);

  const newUser: User.UserRecord = {
    id: value("id", input.id, isNonemptyString),
    displayName: value("displayName", input.displayName, isNonemptyString),
    organization: value("organization", input.organization, isNonemptyString),
    passwordCiphertext: await encryptPassword(value("password", input.password, isNonemptyString))
  };

  // Make sure nobody creates the special "root" user:
  if (newUser.id === "root") throw { kind: "UserAlreadyExists", targetUserId: "root" };

  // Is the user allowed to create new users?
  await throwIfUnauthorized(
    req.token,
    "global.createUser",
    GlobalOnChain.getPermissions(multichain)
  );

  User.create(multichain, req.token, newUser);
  console.log(`Created new user ${newUser.id}.`);

  return [
    500,
    {
      apiVersion: "1.0",
      data: {
        id: newUser.id,
        displayName: newUser.displayName,
        organization: newUser.organization
      }
    }
  ];
};
