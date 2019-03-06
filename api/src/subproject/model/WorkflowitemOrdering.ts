import Intent from "../../authz/intents";
import { MultichainClient } from "../../service/Client.h";
import { Event, throwUnsupportedEventVersion } from "../../service/event";

// Allows a custom ordering among workflowitems. Note that not all workflowitems need
// to be included; those that aren't are simply ordered by their ctime and concatenated
// to what's specified here.
export type WorkflowitemOrdering = string[];
function workflowitemOrderingKey(subprojectId: string): string {
  return `${subprojectId}_workflowitem_ordering`;
}

export async function publishWorkflowitemOrderingUpdate(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  args: {
    createdBy: string;
    creationTimestamp: Date;
    ordering: string[];
  },
): Promise<void> {
  const { createdBy, creationTimestamp, ordering } = args;
  const intent: Intent = "subproject.reorderWorkflowitems";
  const event: Event = {
    key: subprojectId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion: 1,
    data: ordering,
  };
  return multichain
    .getRpcClient()
    .invoke("publish", projectId, workflowitemOrderingKey(subprojectId), {
      json: event,
    });
}

export async function fetchOrderingEvents(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<Event[]> {
  const stream = projectId;
  const streamItemKey = workflowitemOrderingKey(subprojectId);
  const streamItems = await multichain.v2_readStreamItems(stream, streamItemKey);
  const events: Event[] = streamItems.map(x => x.data.json);
  return events;
}

export async function fetchWorkflowitemOrdering(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<WorkflowitemOrdering> {
  // Currently, the workflowitem ordering is stored in full; therefore, we only
  // need to retrieve the latest item(see`publishWorkflowitemOrdering`).
  const expectedDataVersion = 1;
  const nValues = 1;

  const streamItems = await multichain
    .v2_readStreamItems(projectId, workflowitemOrderingKey(subprojectId), nValues)
    .then(items => {
      if (items.length > 0) return items;
      else throw { kind: "NotFound", what: workflowitemOrderingKey(subprojectId) };
    })
    .catch(err => {
      if (err.kind === "NotFound") {
        return [{ data: { json: { dataVersion: 1, data: [] } } }];
      } else {
        throw err;
      }
    });

  const item = streamItems[0];
  const event = item.data.json as Event;
  if (event.dataVersion !== expectedDataVersion) {
    throwUnsupportedEventVersion(event);
  }

  const ordering: string[] = event.data;
  return ordering;
}
