import * as Global from ".";
import { throwIfUnauthorized } from "../authz/index";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import * as User from "../user";
import { hashPassword } from "../user/password";

export const createUser = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  jwtSecret: string,
  rootSecret: string,
): Promise<HttpResponse> => {
  const input = value("data.user", req.body.data.user, x => x !== undefined);

  const passwordDigest = await hashPassword(value("password", input.password, isNonemptyString));

  const newUser: User.UserRecord = {
    id: value("id", input.id, isNonemptyString),
    displayName: value("displayName", input.displayName, isNonemptyString),
    organization: value("organization", input.organization, isNonemptyString),
    passwordDigest,
  };

  // Make sure nobody creates the special "root" user:
  if (newUser.id === "root") throw { kind: "UserAlreadyExists", targetUserId: "root" };

  // Is the user allowed to create new users?
  await throwIfUnauthorized(
    req.token,
    "global.createUser",
    await Global.getPermissions(multichain),
  );

  await User.create(multichain, req.token, newUser);
  console.log(`Created new user ${newUser.id}.`);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        user: {
          id: newUser.id,
          displayName: newUser.displayName,
          organization: newUser.organization,
        },
      },
    },
  ];
};
