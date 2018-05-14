import * as Project from ".";
import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Subproject from "../subproject/model/Subproject";

export const getProjectDetails = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const resource: Project.ProjectDataWithIntents = await Project.getForUser(
    multichain,
    req.token,
    projectId,
  );

  const userIntent: Intent = "project.viewDetails";

  // Is the user allowed to view project details?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Project.getPermissions(multichain, projectId),
  );

  const subprojects = await Subproject.get(multichain, req.token, projectId);

  return [200, { apiVersion: "1.0", data: { ...resource, subprojects } }];
};
