import { getAllowedIntents } from "../authz";
import { isEmpty } from "../lib/emptyChecks";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import { userIdentities } from "../project";
import { User } from "./User";
import {
  getWorkflowitemFromList,
  hashDocuments,
  isUserAllowedTo,
  isWorkflowitemClosable,
  redactHistoryEvent,
  removeEventLog,
  ScrubbedWorkflowitem,
  scrubWorkflowitem,
  sortWorkflowitems,
  Update,
  Workflowitem,
} from "./Workflowitem";

export * from "./Workflowitem";
export * from "./User";

export type CloseNotifier = (workflowitemId, actingUser) => Promise<void>;
export type ListReader = () => Promise<Workflowitem[]>;
export type OrderingReader = () => Promise<string[]>;
export type Closer = (workflowitemId: string) => Promise<void>;
export type UpdateNotifier = (workflowitemId, actingUser) => Promise<void>;
export type Updater = (workflowitemId: string, data: Update) => Promise<void>;

export async function getAllScrubbedItems(
  asUser: User,
  {
    getAllWorkflowitems,
    getWorkflowitemOrdering,
  }: { getAllWorkflowitems: ListReader; getWorkflowitemOrdering: OrderingReader },
): Promise<ScrubbedWorkflowitem[]> {
  const workflowitemOrdering = await getWorkflowitemOrdering();
  const workflowitems = await getAllWorkflowitems();
  const sortedWorkflowitems = sortWorkflowitems(workflowitems, workflowitemOrdering);
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

export async function close(
  closingUser: User,
  workflowitemId: string,
  {
    getOrdering,
    getWorkflowitems,
    closeWorkflowitem,
    notify,
  }: {
    getOrdering: OrderingReader;
    getWorkflowitems: ListReader;
    closeWorkflowitem: Closer;
    notify: CloseNotifier;
  },
): Promise<void> {
  const workflowitemOrdering = await getOrdering();
  const workflowitems = await getWorkflowitems();
  const sortedWorkflowitems = sortWorkflowitems(workflowitems, workflowitemOrdering);
  const closingWorkflowitem: Workflowitem = getWorkflowitemFromList(
    sortedWorkflowitems,
    workflowitemId,
  );
  isWorkflowitemClosable(workflowitemId, closingUser, sortedWorkflowitems);

  await closeWorkflowitem(workflowitemId);
  await notify(closingWorkflowitem, closingUser);
}

export async function update(
  updatingUser: User,
  workflowitemId: string,
  updates: Update,
  {
    getWorkflowitems,
    updateWorkflowitem,
    notify,
  }: {
    getWorkflowitems: ListReader;
    updateWorkflowitem: Updater;
    notify: UpdateNotifier;
  },
): Promise<void> {
  const allowedIntent = "workflowitem.update";
  const workflowitemList: Workflowitem[] = await getWorkflowitems();
  const workflowitemToBeUpdated: Workflowitem = getWorkflowitemFromList(
    workflowitemList,
    workflowitemId,
  );
  const updatedWorkflowitemData: Update = {};
  inheritDefinedProperties(updatedWorkflowitemData, updates, [
    "displayName",
    "description",
    "amount",
    "currency",
    "amountType",
  ]);
  if (!isUserAllowedTo(allowedIntent, workflowitemToBeUpdated, updatingUser)) {
    return Promise.reject("User is not allowed to update workflowitem");
  }
  if (!isEmpty(updates.documents)) {
    updatedWorkflowitemData.documents = await hashDocuments(updates.documents);
  }
  if (updatedWorkflowitemData.amountType === "N/A") {
    delete updatedWorkflowitemData.amount;
    delete updatedWorkflowitemData.currency;
  }
  if (isEmpty(updatedWorkflowitemData)) {
    return Promise.resolve();
  }

  await updateWorkflowitem(workflowitemId, updatedWorkflowitemData);
  await notify(workflowitemId, updatedWorkflowitemData);
}
