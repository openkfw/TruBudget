import { AssertionError } from "assert";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";

export type WorkflowitemOrdering = Workflowitem.Id[];

interface ItemAndIndex {
  index: number;
  workflowitem: Workflowitem.ScrubbedWorkflowitem;
}

export function sortWorkflowitems<
  T extends Workflowitem.ScrubbedWorkflowitem | Workflowitem.Workflowitem
>(workflowitems: T[], ordering: string[]): T[] {
  // The index is needed to enable stable sorting:
  const items = workflowitems.map((workflowitem, index) => ({ index, workflowitem }));

  // Sort in-place:
  items.sort((a, b) => byOrderingCriteria(a, b, ordering));

  // Return the sorted items:
  return items.map(item => item.workflowitem);
}

/**
 * @returns 0 if equal, -1 if a before b, +1 if a after b
 */
function byOrderingCriteria(
  { index: currentIndexA, workflowitem: a }: ItemAndIndex,
  { index: currentIndexB, workflowitem: b }: ItemAndIndex,
  ordering: string[],
): -1 | 1 {
  if (isClosed(a) && isClosed(b)) {
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
    const orderingIndexA = ordering.indexOf(a.id);
    const orderingIndexB = ordering.indexOf(b.id);
    if (orderingIndexA > -1 && orderingIndexB > -1) {
      // both are mentioned in the ordering:
      return orderingIndexA < orderingIndexB ? -1 : 1;
    } else if (orderingIndexA !== -1) {
      // a is mentioned in the ordering, b is not, so a before b:
      return -1;
    } else if (orderingIndexB !== -1) {
      // b is mentioned in the ordering, a is not, so b before a:
      return 1;
    } else {
      // both are not in the ordering, so we sort by ctime instead:
      const cTimeComparison = byCreationTime(a, b);
      // they are the same age we have the ordering unchanged
      if (cTimeComparison === 0) {
        return currentIndexA > currentIndexB ? 1 : -1;
      }
      return cTimeComparison;
    }
  }
}

function isClosed(item: Workflowitem.ScrubbedWorkflowitem): boolean {
  return item.status === "closed";
}

function closedAt(item: Workflowitem.ScrubbedWorkflowitem): any {
  const traceEvent = item.log.find(e => e.businessEvent.type === "workflowitem_closed");

  if (traceEvent === undefined || traceEvent.businessEvent.type !== "workflowitem_closed") {
    return new AssertionError({ message: `Expected close event for workflowitem ${item.id}` });
  }
  const closeEvent = traceEvent.businessEvent;

  return closeEvent.time;
}

function byCreationTime(
  a: Workflowitem.ScrubbedWorkflowitem,
  b: Workflowitem.ScrubbedWorkflowitem,
): -1 | 1 | 0 {
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
