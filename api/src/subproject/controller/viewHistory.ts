import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import flatten from "../../lib/flatMap";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import * as Subproject from "../model/Subproject";
import * as WorkflowitemOrdering from "../model/WorkflowitemOrdering";

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

  const workflowitems = await Workflowitem.get(multichain, req.token, projectId, subprojectId);

  const reorderingEvents = await WorkflowitemOrdering.fetchOrderingEvents(
    multichain,
    projectId,
    subprojectId,
  );

  const events = (subproject.log as Array<Event | Subproject.AugmentedEvent>)
    // Add workflowitems' logs to the subproject log:
    .concat(flatten(workflowitems.map(x => x.log)))
    // Add workflowitem reordering events:
    .concat(reorderingEvents)
    // Sort events by creation time:
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
