import { AuthenticatedRequest, HttpResponse, throwParseError } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient, SubprojectOnChain } from "../multichain";
import * as Project from ".";
import { throwIfUnauthorized } from "../authz";

export const getProjectDetails = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const resource: Project.ProjectDataWithIntents = await Project.getForUser(
    multichain,
    req.token,
    projectId
  );

  // Is the user allowed to view project details?
  await throwIfUnauthorized(
    req.token,
    "project.viewDetails",
    await Project.getPermissions(multichain, projectId)
  );

  const subprojects = await SubprojectOnChain.getAllForUser(multichain, req.token, projectId);

  return [200, { apiVersion: "1.0", data: { ...resource, subprojects } }];
};
