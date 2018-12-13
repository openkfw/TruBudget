import { MultichainClient } from "../multichain";
import * as Workflowitem from "../workflowitem/model/Workflowitem";
import logger from "../lib/logger";

export function sortWorkflowitems(
  workflowitems: Workflowitem.WorkflowitemResource[],
  ordering: string[],
): Workflowitem.WorkflowitemResource[] {
  const indexedItems = workflowitems.map((item, index) => {
    item["_index"] = index;
    return item;
  });
  const sortedItems = indexedItems.sort((a, b) => byOrderingCriteria(a, b, ordering));
  return sortedItems.map(item => {
    delete item["_index"];
    return item;
  });
}

/**
 * @returns 0 if equal, -1 if a before b, +1 if a after b
 */
function byOrderingCriteria(
  a: Workflowitem.WorkflowitemResource,
  b: Workflowitem.WorkflowitemResource,
  ordering: string[],
): -1 | 1 {
  if (isClosed(a) && isClosed(b) && !isRedacted(a) && !isRedacted(b)) {
    // both are closed, so we order by their time of closing:
    const closedAtA = closedAt(a);
    const closedAtB = closedAt(b);
    return closedAtA < closedAtB ? -1 : 1;
  } else if (isClosed(a)) {
    // a is closed, b is not, so a before b:
    return -1;
  } else if (isClosed(b)) {
    // b is closed, a is not, so b before a:
    return 1;
  } else {
    // both are not closed, so we sort according to the ordering:
    const indexA = ordering.indexOf(a.data.id);
    const indexB = ordering.indexOf(b.data.id);
    if (indexA > -1 && indexB > -1) {
      // both are mentioned in the ordering:
      return indexA < indexB ? -1 : 1;
    } else if (indexA !== -1) {
      // a is mentioned in the ordering, b is not, so a before b:
      return -1;
    } else if (indexB !== -1) {
      // b is mentioned in the ordering, a is not, so b before a:
      return 1;
    } else {
      // both are not in the ordering, so we sort by ctime instead:
      const cTimeComparison = byCreationTime(a, b);
      // they are the same age we have the ordering unchanged
      if (cTimeComparison === 0) {
        return a["_index"] > b["_index"] ? 1 : -1;
      }
      return cTimeComparison;
    }
  }
}

function isClosed(item: Workflowitem.WorkflowitemResource): boolean {
  return item.data.status === "closed";
}

function isRedacted(item: Workflowitem.WorkflowitemResource): boolean {
  return item.data.displayName === null;
}

function closedAt(item: Workflowitem.WorkflowitemResource): string {
  const event = item.log.find(e => e.intent === "workflowitem.close");
  if (event === undefined) {
    const message = "Item is not closed.";
    throw Error(`${message}: ${JSON.stringify(event)}`);
  }
  return event.createdAt;
}

function byCreationTime(
  a: Workflowitem.WorkflowitemResource,
  b: Workflowitem.WorkflowitemResource,
): -1 | 1 | 0 {
  const ctimeA = a.data.creationUnixTs;
  const ctimeB = b.data.creationUnixTs;
  if (ctimeA < ctimeB) {
    return -1; // = a is older, so a before b
  } else if (ctimeA > ctimeB) {
    return 1; // = a is more recent, so b before a
  } else {
    // creation times are equal
    return 0;
  }
}
