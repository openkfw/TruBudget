import { getAllowedIntents } from "../authz";
import { userIdentities } from "../project";
import { User } from "./User";
import {
  redactHistoryEvent,
  scrubWorkflowitem,
  removeEventLog,
  ScrubbedWorkflowitem,
  sortWorkflowitems,
  Workflowitem,
} from "./Workflowitem";

export * from "./Workflowitem";
export * from "./User";

export type ListReader = () => Promise<Workflowitem[]>;
export type OrderingReader = () => Promise<string[]>;

export async function getAllScrubbedItems(
  asUser: User,
  {
    getAllWorkflowitems,
    getWorkflowitemOrdering,
  }: { getAllWorkflowitems: ListReader; getWorkflowitemOrdering: OrderingReader },
): Promise<ScrubbedWorkflowitem[]> {
  const workflowitemOrdering = await getWorkflowitemOrdering();
  const workflowitems = await getAllWorkflowitems();
  const sortedWorkflowitems = await sortWorkflowitems(workflowitems, workflowitemOrdering);
  const scrubbedWorkflowitems = await sortedWorkflowitems.map(workflowitem => {
    workflowitem.log.map(historyevent =>
      redactHistoryEvent(
        historyevent,
        getAllowedIntents(userIdentities(asUser), workflowitem.permissions),
      ),
    );
    return scrubWorkflowitem(workflowitem, asUser);
  });

  return scrubbedWorkflowitems.map(removeEventLog);
}
