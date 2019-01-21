import { User } from "./User";
import {
  isWorkflowitemVisibleTo,
  removeEventLog,
  sortWorkflowitems,
  Workflowitem,
} from "./Workflowitem";

export * from "./Workflowitem";
export * from "./User";

export type ListReader = () => Promise<Workflowitem[]>;
export type OrderingReader = () => Promise<string[]>;

export async function getAllVisible(
  asUser: User,
  {
    getAllWorkflowitems,
    getWorkflowitemOrdering,
  }: { getAllWorkflowitems: ListReader; getWorkflowitemOrdering: OrderingReader },
): Promise<Workflowitem[]> {
  const workflowitemOrdering = await getWorkflowitemOrdering();
  const workflowitems = await getAllWorkflowitems();
  const authorizedWorkflowitems = await workflowitems.filter(workflowitem =>
    isWorkflowitemVisibleTo(workflowitem, asUser),
  );
  const sortedWorkflowitems = await sortWorkflowitems(
    authorizedWorkflowitems,
    workflowitemOrdering,
  );
  return sortedWorkflowitems.map(removeEventLog);
}
