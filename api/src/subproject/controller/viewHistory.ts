import { HttpResponse } from "../../httpd/lib";
import flatten from "../../lib/flatMap";
import { isNonemptyString, isNumber, value } from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";
import { Event } from "../../service/event";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import * as Subproject from "../model/Subproject";
import * as WorkflowitemOrdering from "../model/WorkflowitemOrdering";

export async function getSubprojectHistory(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const offset: number = value("offset", parseInt(input.offset, 10), isNumber);
  const limit: number = value("limit", parseInt(input.limit, 10), isNumber);

  const subproject = await Subproject.get(multichain, req.user, projectId, subprojectId).then(
    resources => resources[0],
  );

  const workflowitems = await Workflowitem.get(multichain, req.user, projectId, subprojectId);

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
        events: events.slice(offset, offset + limit),
        historyItemsCount: events.length,
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
