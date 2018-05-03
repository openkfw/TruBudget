import * as Workflowitem from ".";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib";
import { MultichainClient } from "../multichain";
import { sortWorkflowitems } from "../subproject/lib/sortSubprojects";

export const getWorkflowitemList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const workflowitems: Array<
    Workflowitem.DataWithIntents | Workflowitem.ObscuredDataWithIntents
  > = await Workflowitem.getAll(multichain, projectId, subprojectId)
    .then(allItems => sortWorkflowitems(multichain, projectId, allItems))
    .then(sortedItems => Workflowitem.forUser(req.token, sortedItems));

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        workflowitems,
      },
    },
  ];
};
