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

export const getUserList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const users = await User.getAll(multichain);

  // users are not filtered for now (user.list and user.view is always allowed)

  const passwordlessUsers = users.map(user => ({
    id: user.id,
    displayName: user.displayName,
    organization: user.organization
  }));

  return [
    200,
    {
      apiVersion: "1.0",
      data: { items: passwordlessUsers }
    }
  ];
};
