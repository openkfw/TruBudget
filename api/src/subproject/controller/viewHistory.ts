import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Workflowitem from "../../workflowitem";
import * as Subproject from "../model/Subproject";

export async function getSubprojectHistory(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const subproject = await Subproject.get(multichain, req.token, projectId, subprojectId).then(
    resources => resources[0],
  );

  // Add workflowitems' logs to the subproject log and sort by creation time:
  const workflowitems = await Workflowitem.get(multichain, req.token, projectId, subprojectId);
  const events = workflowitems
    .reduce((eventsAcc, workflowitem) => eventsAcc.concat(workflowitem.log), subproject.log)
    .sort(compareEvents);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        events,
      },
    },
  ];
}

function compareEvents(a: Event, b: Event): number {
  const tsA = new Date(a.createdAt);
  const tsB = new Date(b.createdAt);
  if (tsA < tsB) return 1;
  if (tsA > tsB) return -1;
  return 0;
}
