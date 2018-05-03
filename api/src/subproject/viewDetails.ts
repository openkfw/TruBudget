import * as Subproject from ".";
import { throwIfUnauthorized } from "../authz";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import * as Project from "../project";
import * as Workflowitem from "../workflowitem";
import { sortWorkflowitems } from "./lib/sortSubprojects";

export const getSubprojectDetails = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const subproject: Subproject.SubprojectDataWithIntents = await Subproject.getForUser(
    multichain,
    req.token,
    projectId,
    subprojectId,
  );

  // Is the user allowed to view subproject details?
  await throwIfUnauthorized(
    req.token,
    "subproject.viewDetails",
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const workflowitems: Array<
    Workflowitem.DataWithIntents | Workflowitem.ObscuredDataWithIntents
  > = await Workflowitem.getAll(multichain, projectId, subprojectId)
    .then(allItems => sortWorkflowitems(multichain, projectId, allItems))
    .then(sortedItems => Workflowitem.forUser(req.token, sortedItems));

  const parentProject = await Project.get(multichain, req.token, projectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        subproject,
        workflowitems,
        parentProject: { id: parentProject.id, displayName: parentProject.displayName },
      },
    },
  ];
};
