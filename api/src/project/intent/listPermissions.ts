import * as Project from "..";
import { throwIfUnauthorized } from "../../authz";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib";
import { MultichainClient } from "../../multichain";

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
