import * as Workflowitem from ".";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { sortWorkflowitems } from "../subproject/lib/sortWorkflowitems";

export const getWorkflowitemList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const sortedItems = await Workflowitem.get(multichain, req.token, projectId, subprojectId).then(
    unsortedItems => sortWorkflowitems(multichain, projectId, subprojectId, unsortedItems),
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        workflowitems: sortedItems,
      },
    },
  ];
};
