import { AuthenticatedRequest, HttpResponse, throwParseError } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient, SubprojectOnChain } from "../multichain";
import * as Workflowitem from "../workflowitem";
import * as Project from "../project";
import { SubprojectDataWithIntents } from "../multichain/resources/subproject";
import { throwIfUnauthorized } from "../authz";

export const getSubprojectDetails = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const subproject: SubprojectDataWithIntents = await SubprojectOnChain.getForUser(
    multichain,
    req.token,
    projectId,
    subprojectId
  );

  // Is the user allowed to view subproject details?
  await throwIfUnauthorized(
    req.token,
    "subproject.viewDetails",
    await SubprojectOnChain.getPermissions(multichain, projectId, subprojectId)
  );

  const workflowitems: Workflowitem.DataWithIntents[] = await Workflowitem.getAllForUser(
    multichain,
    req.token,
    projectId,
    subprojectId
  );

  const parentProject = await Project.get(multichain, req.token, projectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        subproject,
        workflowitems,
        parentProject: { id: parentProject.id, displayName: parentProject.displayName }
      }
    }
  ];
};
