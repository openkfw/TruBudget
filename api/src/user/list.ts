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
import Intent from "../authz/intents";
import { getAllowedIntents } from "../authz/index";

const value = (name, val, isValid) => {
  if (isValid !== undefined && !isValid(val)) {
    throwParseError([name]);
  }
  return val;
};

export const getUserList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  return [
    200,
    {
      apiVersion: "1.0",
      data: { items: await list(multichain, req.token) }
    }
  ];
};

const list = async (
  multichain: MultichainClient,
  token: AuthToken
): Promise<User.UserWithoutPassword[]> => {
  const users = await User.getAll(multichain);

  if (users.length === 0) {
    return [];
  }

  // TODO users are not filtered for now (user.list and user.view is always allowed)

  return users.map(user => ({
    id: user.id,
    displayName: user.displayName,
    organization: user.organization
  }));
};
