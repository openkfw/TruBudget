import { throwIfUnauthorized } from "../authz";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Subproject from ".";

export const assignSubproject = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const userId: string = value("userId", input.userId, isNonemptyString);

  // Is the user allowed to (re-)assign a workflowitem?
  await throwIfUnauthorized(
    req.token,
    "subproject.assign",
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  await Subproject.assign(multichain, projectId, subprojectId, userId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
