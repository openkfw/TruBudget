import { AssertionError } from "assert";

import * as Workflowitem from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";

export type WorkflowitemOrdering = Workflowitem.Id[];

export function sortWorkflowitems(
  items: Workflowitem.Workflowitem[],
  ordering: string[],
): Workflowitem.Workflowitem[] {
  const indexedItems = items.map((item, index) => {
    // tslint:disable-next-line:no-string-literal
    item["_index"] = index;
    return item;
  });
  const sortedItems = indexedItems.sort((a, b) => byOrderingCriteria(a, b, ordering));
  return sortedItems.map(item => {
    // tslint:disable-next-line:no-string-literal
    delete item["_index"];
    return item;
  });
}

/**
 * @returns 0 if equal, -1 if a before b, +1 if a after b
 */
function byOrderingCriteria(
  a: Workflowitem.Workflowitem,
  b: Workflowitem.Workflowitem,
  ordering: string[],
): -1 | 1 {
  if (isClosed(a) && isClosed(b) && !a.isRedacted && !b.isRedacted) {
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
    const indexA = ordering.indexOf(a.id);
    const indexB = ordering.indexOf(b.id);
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
        // tslint:disable-next-line:no-string-literal
        return a["_index"] > b["_index"] ? 1 : -1;
      }
      return cTimeComparison;
    }
  }
}

function isClosed(item: Workflowitem.Workflowitem): boolean {
  return item.status === "closed";
}

function closedAt(item: Workflowitem.Workflowitem): string {
  const traceEvent = item.log.find(e => e.businessEvent.type === "workflowitem_closed");

  if (traceEvent === undefined) {
    throw new AssertionError({ message: `Expected close event for workflowitem ${item.id}` });
  }
  const closeEvent = traceEvent.businessEvent as WorkflowitemClosed.Event;

  return closeEvent.time;
}

function byCreationTime(a: Workflowitem.Workflowitem, b: Workflowitem.Workflowitem): -1 | 1 | 0 {
  const ctimeA = new Date(a.createdAt);
  const ctimeB = new Date(b.createdAt);
  if (ctimeA < ctimeB) {
    return -1; // = a is older, so a before b
  } else if (ctimeA > ctimeB) {
    return 1; // = a is more recent, so b before a
  } else {
    // creation times are equal
    return 0;
  }
}
