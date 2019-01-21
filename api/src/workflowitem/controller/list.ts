import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain/Client.h";
import { fetchWorkflowitemOrdering } from "../../subproject/model/WorkflowitemOrdering";
import { sortWorkflowitems } from "../../subproject/sortWorkflowitems";
import * as Workflowitem from "../model/Workflowitem";

interface WorkflowitemDTO {
  allowedIntents: Intent[];
  data: Workflowitem.Data;
}

function removeEventLog(workflowitem: Workflowitem.WorkflowitemResource): WorkflowitemDTO {
  delete workflowitem.log;
  return workflowitem;
}

export async function getWorkflowitemList(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const ordering = await fetchWorkflowitemOrdering(multichain, projectId, subprojectId);
  const workflowitems: WorkflowitemDTO[] = await Workflowitem.get(
    multichain,
    req.user,
    projectId,
    subprojectId,
  )
    .then(unsortedItems => sortWorkflowitems(unsortedItems, ordering))
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
}
