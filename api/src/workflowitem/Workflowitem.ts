import Joi = require("joi");

import { getAllowedIntents } from "../authz";
import { getUserAndGroups } from "../authz";
import { onlyAllowedData } from "../authz/history";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent } from "../authz/types";
import { isNotEmpty } from "../lib/emptyChecks";
import { Event } from "../multichain/event";
import { userIdentities } from "../project";

interface HistoryEvent {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
  snapshot: {
    displayName: string;
    amount: string;
    currency: string;
    amountType: string;
  };
}
export interface Item {
  id: string;
  creationUnixTs: string;
  displayName: string | null;
  exchangeRate?: string | null;
  billingDate?: string | null;
  amount?: string | null;
  currency?: string | null;
  amountType: "N/A" | "disbursed" | "allocated" | null;
  description: string | null;
  status: "open" | "closed";
  assignee?: string | null;
  documents?: Document[] | [];
  permissions: AllowedUserGroupsByIntent | null;
  log: HistoryEvent[] | [];
}

export interface Workflowitem extends Item {
  id: string;
  creationUnixTs: string;
  displayName: string;
  exchangeRate?: string;
  billingDate?: string;
  amount?: string;
  currency?: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  assignee?: string;
  documents?: Document[];
  permissions: AllowedUserGroupsByIntent;
  log: HistoryEvent[];
}

export interface RedactedWorkflowitem extends Item {
  id: string;
  creationUnixTs: string;
  displayName: null;
  exchangeRate?: null;
  billingDate?: null;
  amount?: null;
  currency?: null;
  amountType: null;
  description: null;
  status: "open" | "closed";
  assignee?: null;
  documents?: [];
  permissions: AllowedUserGroupsByIntent;
  log: [];
}

const schema = Joi.object().keys({
  id: Joi.string().required(),
  creationUnixTs: Joi.date()
    .timestamp("unix")
    .required(),
  displayName: Joi.string().required(),
  exchangeRate: Joi.string(),
  // TODO set proper date format
  billingDate: Joi.string(),
  amount: Joi.string(),
  currency: Joi.string(),
  amountType: Joi.string().valid("N/A", "disbursed", "allocated"),
  description: Joi.string().allow(""),
  status: Joi.string().valid("open", "closed"),
  assignee: Joi.string(),
  documents: Joi.array().items(
    Joi.object().keys({
      id: Joi.string(),
      hash: Joi.string(),
    }),
  ), // Document[],
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
  log: Joi.any(),
});

export function validateWorkflowitem(input: any): Workflowitem {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value as Workflowitem;
  } else {
    throw error;
  }
}

export function redactWorkflowitem(workflowitem, user): Item {
  const isWorkflowitemVisibleToUser = isWorkflowitemVisibleTo(workflowitem, user);
  if (!isWorkflowitemVisibleToUser) {
    return redactWorkflowitemData(workflowitem) as Item;
  }
  return workflowitem;
}
export function isWorkflowitemVisibleTo(workflowitem, user): boolean {
  const allowedIntent: Intent = "workflowitem.view";
  const userIntents = getAllowedIntents(userIdentities(user), workflowitem.permissions);
  console.log({ allowedIntent, userIntents });

  const isAllowedToSeeData = userIntents.includes(allowedIntent);
  console.log(isAllowedToSeeData);
  return isAllowedToSeeData;
}
export function redactWorkflowitemHistory(workflowitem, user): Workflowitem {
  if (workflowitem.log) {
    workflowitem.log = workflowitem.log
      .map(
        event =>
          onlyAllowedData(
            event,
            getAllowedIntents(getUserAndGroups(user), workflowitem.permissions),
          ) as Event | null,
      )
      .filter(isNotEmpty);
  }
  return workflowitem;
}

export function sortWorkflowitems(
  workflowitems: Workflowitem[],
  ordering: string[],
): Workflowitem[] {
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
function byOrderingCriteria(a: Workflowitem, b: Workflowitem, ordering: string[]): -1 | 1 {
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
        return a["_index"] > b["_index"] ? 1 : -1;
      }
      return cTimeComparison;
    }
  }
}

function isClosed(item: Workflowitem): boolean {
  return item.status === "closed";
}

function isRedacted(item: Workflowitem): boolean {
  return item.displayName === null;
}

function closedAt(item: Workflowitem): string {
  const event = item.log.find(e => e.intent === "workflowitem.close");
  if (event === undefined) {
    const message = "Item is not closed.";
    throw Error(`${message}: ${JSON.stringify(event)}`);
  }
  return event.createdAt;
}

function byCreationTime(a: Workflowitem, b: Workflowitem): -1 | 1 | 0 {
  const ctimeA = a.creationUnixTs;
  const ctimeB = b.creationUnixTs;
  if (ctimeA < ctimeB) {
    return -1; // = a is older, so a before b
  } else if (ctimeA > ctimeB) {
    return 1; // = a is more recent, so b before a
  } else {
    // creation times are equal
    return 0;
  }
}

export function removeEventLog(workflowitem: Workflowitem): Workflowitem {
  delete workflowitem.log;
  return workflowitem;
}

export const redactWorkflowitemData = (workflowitem: Workflowitem): RedactedWorkflowitem => ({
  id: workflowitem.id,
  creationUnixTs: workflowitem.creationUnixTs,
  displayName: null,
  exchangeRate: null,
  billingDate: null,
  amount: null,
  currency: null,
  amountType: null,
  description: null,
  status: workflowitem.status,
  assignee: null,
  permissions: workflowitem.permissions,
  log: [],
});
