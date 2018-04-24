import * as express from "express";
import { AuthToken } from "../authz/token";
import {
  HttpResponse,
  throwParseError,
  throwParseErrorIfUndefined,
  AuthenticatedRequest
} from "../httpd/lib";
import { MultichainClient, SubprojectOnChain, GlobalOnChain } from "../multichain";
import { SubprojectDataWithIntents } from "../multichain/resources/subproject";
import { isNonemptyString } from "../lib";
import * as User from "./index";
import Intent, { globalIntents } from "../authz/intents";
import { getAllowedIntents } from "../authz/index";
import { encryptPassword } from "./hash";
import * as jsonwebtoken from "jsonwebtoken";

export interface UserLoginResponse {
  id: string;
  displayName: string;
  organization: string;
  allowedIntents: string[];
  token: string;
}

const value = (name, val, isValid) => {
  if (isValid !== undefined && !isValid(val)) {
    throwParseError([name]);
  }
  return val;
};

export const authenticateUser = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
  jwtSecret: string,
  rootSecret: string
): Promise<HttpResponse> => {
  const input = value("body.user", req.body.user, x => x !== undefined);

  const id: string = value("id", input.id, isNonemptyString);
  const passwordCleartext: string = value("password", input.password, isNonemptyString);

  return [
    200,
    {
      apiVersion: "1.0",
      data: await authenticate(multichain, jwtSecret, rootSecret, id, passwordCleartext)
    }
  ];
};

const authenticate = async (
  multichain: MultichainClient,
  jwtSecret: string,
  rootSecret: string,
  id: string,
  passwordCleartext: string
): Promise<UserLoginResponse> => {
  // The client shouldn't be able to distinguish between a wrong id and a wrong password,
  // so we handle all errors alike:
  const throwError = err => {
    console.log(`Authentication failed: ${err}`);
    throw { kind: "AuthenticationError", userId: id };
  };

  // The special "root" user is not on the chain:
  if (id === "root") {
    if (passwordCleartext === rootSecret) {
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

  const passwordCiphertext = await encryptPassword(passwordCleartext);
  const isPasswordMatch = passwordCiphertext === storedUser.passwordCiphertext;
  if (!isPasswordMatch) throwError("wrong password");

  const token = { userId: storedUser.id, organization: storedUser.organization };
  return {
    id,
    displayName: storedUser.displayName,
    organization: storedUser.organization,
    allowedIntents: await getAllowedIntents(
      token,
      await GlobalOnChain.getPermissions(this.multichain)
    ),
    token: createToken(jwtSecret, id, storedUser.organization)
  };
};

const createToken = (secret: string, userId: string, organization: string): string =>
  jsonwebtoken.sign({ userId, organization }, secret, { expiresIn: "1h" });

const rootUserLoginResponse = (token: string): UserLoginResponse => ({
  id: "root",
  displayName: "root",
  organization: "root",
  allowedIntents: globalIntents,
  token
});
