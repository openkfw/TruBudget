import { User } from "./User";
import {
  redactWorkflowitem,
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
  const sortedWorkflowitems = await sortWorkflowitems(workflowitems, workflowitemOrdering);
  const redactedWorkflowitems = await sortedWorkflowitems.map(workflowitem =>
    redactWorkflowitem(workflowitem, asUser),
  );

  // return redactedWorkflowitems.map(removeEventLog);
  return sortedWorkflowitems.map(removeEventLog);
}
