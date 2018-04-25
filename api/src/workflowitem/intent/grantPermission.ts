import * as express from "express";
import { MultichainClient } from "../../multichain";
import { AuthenticatedRequest, HttpResponse, throwParseError } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import Intent, { allIntents } from "../../authz/intents";
import { throwIfUnauthorized } from "../../authz";
import * as Workflowitem from "..";

export const grantWorkflowitemPermission = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);
  const intent = value("intent", input.intent, x => allIntents.includes(x));

  // Is the user allowed to grant workflowitem permissions?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.intent.grantPermission",
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId)
  );

  await Workflowitem.grantPermission(multichain, projectId, workflowitemId, userId, intent);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK"
    }
  ];
};
