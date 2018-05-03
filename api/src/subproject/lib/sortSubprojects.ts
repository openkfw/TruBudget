import * as Subproject from "..";
import { MultichainClient } from "../../multichain";
import * as Workflowitem from "../../workflowitem";

export const sortWorkflowitems = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitems: Workflowitem.WorkflowitemResource[],
): Promise<Workflowitem.WorkflowitemResource[]> => {
  const itemMap = workflowitems.reduce((map, resource) => {
    map[resource.data.id] = resource;
    return map;
  }, {});

  const ordering = await Subproject.getWorkflowitemOrdering(multichain, projectId);

  // Start with all items that occur in the ordering:
  const orderedItems = ordering.map(
    id => popProperty(itemMap, id) as Workflowitem.WorkflowitemResource,
  );

  // Add remaining items sorted by their ctime:
  const remainingItems = Object.values(itemMap) as Workflowitem.WorkflowitemResource[];
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

const popProperty = (obj: object, key: string): object => {
  const val = obj[key];
  delete obj[key];
  return val;
};
