import * as Subproject from "..";
import { throwIfUnauthorized } from "../../authz";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";

export const getSubprojectPermissions = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", input.subprojectId, isNonemptyString);

  // Is the user allowed to list subproject permissions?
  await throwIfUnauthorized(
    req.token,
    "subproject.intent.listPermissions",
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const permissions = await Subproject.getPermissions(multichain, projectId, subprojectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: permissions,
    },
  ];
};
