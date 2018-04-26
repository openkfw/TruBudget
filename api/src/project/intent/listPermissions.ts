import * as express from "express";
import { MultichainClient } from "../../multichain";
import { AuthenticatedRequest, HttpResponse, throwParseError } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { allIntents } from "../../authz/intents";
import { throwIfUnauthorized } from "../../authz";
import * as Project from "..";

export const getProjectPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);

  // Is the user allowed to list project permissions?
  await throwIfUnauthorized(
    req.token,
    "project.intent.listPermissions",
    await Project.getPermissions(multichain, projectId)
  );

  const permissions = await Project.getPermissions(multichain, projectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions
    }
  ];
};
