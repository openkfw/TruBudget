import { MultichainClient } from "../multichain";
import * as Workflowitem from "../workflowitem/model/workflowitem";
import { fetchWorkflowitemOrdering } from "./model/WorkflowitemOrdering";

export const sortWorkflowitems = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  workflowitems: Workflowitem.WorkflowitemResource[],
): Promise<Workflowitem.WorkflowitemResource[]> => {
  const itemMap = new Map<string, Workflowitem.WorkflowitemResource>();
  for (const resource of workflowitems) {
    itemMap.set(resource.data.id, resource);
  }

  const ordering = await fetchWorkflowitemOrdering(multichain, projectId, subprojectId);

  // Start with all items that occur in the ordering:
  const orderedItems = ordering.map(id => pop(itemMap, id));

  // Add remaining items sorted by their ctime:
  const remainingItems = [...itemMap.values()];
  remainingItems.sort(byCreationTime).forEach(item => orderedItems.push(item));

  return orderedItems;
};

const byCreationTime = (
  a: Workflowitem.WorkflowitemResource,
  b: Workflowitem.WorkflowitemResource,
): -1 | 1 => {
  const ctimeA = a.data.creationUnixTs;
  const ctimeB = b.data.creationUnixTs;
  if (ctimeA < ctimeB) {
    return -1; // = a is older, so a before b
  } else if (ctimeA > ctimeB) {
    return 1; // = a is more recent, so b before a
  } else {
    // Let's be deterministic here and sort by ID as the fallback:
    if (a.data.id < b.data.id) {
      return -1;
    } else {
      return 1;
    }
  }
};

const pop = (
  map: Map<string, Workflowitem.WorkflowitemResource>,
  key: string,
): Workflowitem.WorkflowitemResource => {
  const val = map.get(key);
  map.delete(key);
  return val!;
};
