import Joi = require("joi");

import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import { Event, throwUnsupportedEventVersion } from "../multichain/event";
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
export interface Workflowitem {
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

export interface RedactedWorkflowitem {
  id: string;
  creationUnixTs: string;
  displayName: null;
  amount: null;
  currency: null;
  amountType: null;
  description: null;
  status: "open" | "closed";
  assignee: null;
  documents: null;
  exchangeRate: null;
  billingDate: null;
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
  description: Joi.string(),
  status: Joi.string().valid("open", "closed"),
  assignee: Joi.string(),
  // TODO validate document type
  documents: Joi.array().items(Joi.string()), // Document[],
  permissions: Joi.any(),
});

export function validateWorkflowitem(input: any): Workflowitem {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value as Workflowitem;
  } else {
    throw error;
  }
}

export function isWorkflowitemVisibleTo(workflowitem, user): boolean {
  const allowedIntent: Intent = "workflowitem.view";
  const userIntents = getAllowedIntents(userIdentities(user), workflowitem.permissions);
  return true;
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
  amount: null,
  currency: null,
  amountType: null,
  description: null,
  status: workflowitem.status,
  assignee: null,
  documents: null,
  exchangeRate: null,
  billingDate: null,
});
