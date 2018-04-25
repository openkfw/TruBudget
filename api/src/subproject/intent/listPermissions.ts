import * as express from "express";
import { MultichainClient, SubprojectOnChain } from "../../multichain";
import { AuthenticatedRequest, HttpResponse, throwParseError } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { allIntents } from "../../authz/intents";
import { throwIfUnauthorized } from "../../authz";

export const getSubprojectPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", input.subprojectId, isNonemptyString);

  // Is the user allowed to list subproject permissions?
  await throwIfUnauthorized(
    req.token,
    "subproject.intent.listPermissions",
    await SubprojectOnChain.getPermissions(multichain, projectId, subprojectId)
  );

  const permissions = await SubprojectOnChain.getPermissions(multichain, projectId, subprojectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions
    }
  ];
};
