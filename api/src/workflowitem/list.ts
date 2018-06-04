import * as Workflowitem from ".";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import { sortWorkflowitems } from "../subproject/sortWorkflowitems";

interface WorkflowitemDTO {
  allowedIntents: Intent[];
  data: Workflowitem.Data;
}

function removeEventLog(workflowitem: Workflowitem.WorkflowitemResource): WorkflowitemDTO {
  delete workflowitem.log;
  return workflowitem;
}

export const getWorkflowitemList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const workflowitems: WorkflowitemDTO[] = await Workflowitem.get(
    multichain,
    req.token,
    projectId,
    subprojectId,
  )
    .then(unsortedItems => sortWorkflowitems(multichain, projectId, subprojectId, unsortedItems))
    .then(sortedItems => sortedItems.map(removeEventLog));

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
