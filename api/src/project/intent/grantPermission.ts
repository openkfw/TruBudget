import * as express from "express";
import { MultichainClient } from "../../multichain";
import { AuthenticatedRequest, HttpResponse, throwParseError } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import Intent, { allIntents } from "../../authz/intents";
import { throwIfUnauthorized } from "../../authz";
import * as Project from "..";

export const grantProjectPermission = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to grant project permissions?
  await throwIfUnauthorized(
    req.token,
    "project.intent.grantPermission",
    await Project.getPermissions(multichain, projectId)
  );

  await Project.grantPermission(multichain, projectId, userId, intent);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK"
    }
  ];
};
