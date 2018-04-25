import * as express from "express";
import { MultichainClient } from "../../multichain";
import { AuthenticatedRequest, HttpResponse, throwParseError } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { allIntents } from "../../authz/intents";
import { throwIfUnauthorized } from "../../authz";
import * as Workflowitem from "..";

export const getWorkflowitemPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);
  const workflowitemId = value("workflowitemId", input.workflowitemId, isNonemptyString);

  // Is the user allowed to list workflowitem permissions?
  await throwIfUnauthorized(
    req.token,
    "workflowitem.intent.listPermissions",
    await Workflowitem.getPermissions(multichain, projectId, workflowitemId)
  );

  const permissions = await Workflowitem.getPermissions(multichain, projectId, workflowitemId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions
    }
  ];
};
