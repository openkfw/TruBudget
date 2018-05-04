import * as jsonwebtoken from "jsonwebtoken";
import * as User from ".";
import { getAllowedIntents } from "../authz/index";
import { globalIntents } from "../authz/intents";
import * as Global from "../global";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import { hashPassword, isPasswordMatch } from "./password";

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  token: string;
}

export const authenticateUser = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  jwtSecret: string,
  rootSecret: string,
): Promise<HttpResponse> => {
  const input = value("data.user", req.body.data.user, x => x !== undefined);

  const id: string = value("id", input.id, isNonemptyString);
  const password: string = value("password", input.password, isNonemptyString);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        user: await authenticate(multichain, jwtSecret, rootSecret, id, password),
      },
    },
  ];
};

const authenticate = async (
  multichain: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  id: string,
  password: string,
): Promise<UserLoginResponse> => {
  // The client shouldn't be able to distinguish between a wrong id and a wrong password,
  // so we handle all errors alike:
  const throwError = err => {
    console.log(`Authentication failed: ${err}`);
    throw { kind: "AuthenticationError", userId: id };
  };

  // The special "root" user is not on the chain:
  if (id === "root") {
    // Prevent timing attacks by using the constant-time compare function
    // instead of simple string comparison:
    const rootSecretHash = await hashPassword(rootSecret);
    if (await isPasswordMatch(password, rootSecretHash)) {
      return rootUserLoginResponse(createToken(jwtSecret, "root", "root"));
    } else {
      throwError("wrong password");
    }
  }

  const storedUser = await User.get(multichain, id).catch(err => {
    switch (err.kind) {
      case "NotFound":
        throwError("user not found");
      default:
        throw err;
    }
  });

  if (!(await isPasswordMatch(password, storedUser.passwordDigest))) {
    throwError("wrong password");
  }

  const token = { userId: storedUser.id, organization: storedUser.organization };
  return {
    id,
    displayName: storedUser.displayName,
    organization: storedUser.organization,
    allowedIntents: await getAllowedIntents(token, await Global.getPermissions(multichain)),
    token: createToken(jwtSecret, id, storedUser.organization),
  };
};

const createToken = (secret: string, userId: string, organization: string): string =>
  jsonwebtoken.sign({ userId, organization }, secret, { expiresIn: "1h" });

const rootUserLoginResponse = (token: string): UserLoginResponse => ({
  id: "root",
  displayName: "root",
  organization: "root",
  allowedIntents: globalIntents,
  token,
});
