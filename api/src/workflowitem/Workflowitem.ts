import Joi = require("joi");

import { getAllowedIntents, hasIntersection } from "../authz";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent } from "../authz/types";
import { userIdentities } from "../project";
import { User } from "../project/User";

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

type ScrubbedHistoryEvent = null | HistoryEvent;

export interface Document {
  id: string;
  hash: string;
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

export type ScrubbedWorkflowitem = Workflowitem | RedactedWorkflowitem;

export interface RedactedWorkflowitem {
  id: string;
  creationUnixTs: string;
  displayName: null;
  exchangeRate: null;
  billingDate?: null;
  amount?: null;
  currency?: null;
  amountType: null;
  description: null;
  status: "open" | "closed";
  assignee?: null;
  documents?: null;
  permissions: null;
  log: null;
}

const schema = Joi.object().keys({
  id: Joi.string().required(),
  creationUnixTs: Joi.date()
    .timestamp("unix")
    .required(),
  displayName: Joi.string().required(),
  exchangeRate: Joi.string().when("status", {
    is: Joi.valid("closed"),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  billingDate: Joi.date()
    .iso()
    .when("status", {
      is: Joi.valid("closed"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  amount: Joi.string()
    .when("amountType", {
      is: Joi.valid("disbursed", "allocated"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when("status", { is: Joi.valid("closed"), then: Joi.required(), otherwise: Joi.optional() })
    .when("amountType", { is: Joi.valid("N/A"), then: Joi.forbidden() }),
  currency: Joi.string()
    .when("amountType", {
      is: Joi.valid("disbursed", "allocated"),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .when("status", { is: Joi.valid("closed"), then: Joi.required(), otherwise: Joi.optional() }),
  amountType: Joi.string()
    .valid("N/A", "disbursed", "allocated")
    .required(),
  description: Joi.string().allow(""),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
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
  log: Joi.array(),
});

export function validateWorkflowitem(input: any): Workflowitem {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value as Workflowitem;
  } else {
    throw error;
  }
}

export function scrubWorkflowitem(workflowitem: Workflowitem, user: User): ScrubbedWorkflowitem {
  if (!isWorkflowitemVisibleTo(workflowitem, user)) {
    const scrubbedWorkflowitem = redactWorkflowitemData(workflowitem);
    return scrubbedWorkflowitem;
  }
  return workflowitem;
}
function isWorkflowitemVisibleTo(workflowitem: Workflowitem, user: User): boolean {
  const allowedIntent: Intent = "workflowitem.view";
  const userIntents = getAllowedIntents(userIdentities(user), workflowitem.permissions);

  const isAllowedToSeeData = userIntents.includes(allowedIntent);
  return isAllowedToSeeData;
}

export function sortWorkflowitems(
  workflowitems: Workflowitem[],
  ordering: string[],
): Workflowitem[] {
  const indexedItems = workflowitems.map((item, index) => {
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
        // tslint:disable-next-line:no-string-literal
        return a["_index"] > b["_index"] ? 1 : -1;
      }
      return cTimeComparison;
    }
  }
}

function isClosed(item: ScrubbedWorkflowitem): boolean {
  return item.status === "closed";
}

function isRedacted(item: ScrubbedWorkflowitem): boolean {
  return item.displayName === null;
}

function closedAt(item: Workflowitem): Promise<string> {
  const event = item.log.find(e => e.intent === "workflowitem.close");
  if (event === undefined) {
    const message = "Item is not closed.";
    Promise.reject(Error(`${message}: ${JSON.stringify(event)}`));
  }
  return event ? Promise.resolve(event.createdAt) : Promise.reject(Error(`Event is undefined`));
}

function byCreationTime(a: ScrubbedWorkflowitem, b: ScrubbedWorkflowitem): -1 | 1 | 0 {
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

export function removeEventLog(workflowitem: ScrubbedWorkflowitem): ScrubbedWorkflowitem {
  delete workflowitem.log;
  return workflowitem;
}

const redactWorkflowitemData = (workflowitem: Workflowitem): RedactedWorkflowitem => ({
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
  permissions: null,
  log: null,
  documents: null,
});

const requiredPermissions = new Map<Intent, Intent[]>([
  ["workflowitem.intent.grantPermission", ["workflowitem.intent.listPermissions"]],
  ["workflowitem.intent.revokePermission", ["workflowitem.intent.listPermissions"]],
  ["workflowitem.assign", ["workflowitem.view"]],
  ["workflowitem.update", ["workflowitem.view"]],
  ["workflowitem.close", ["workflowitem.view"]],
  ["workflowitem.archive", ["workflowitem.view"]],
]);

export function redactHistoryEvent(
  event: HistoryEvent,
  userIntents: Intent[],
): ScrubbedHistoryEvent {
  const observedIntent = event.intent;
  if (requiredPermissions.has(observedIntent)) {
    const allowedIntents = requiredPermissions.get(observedIntent);
    const isAllowedToSee = hasIntersection(allowedIntents, userIntents);

    if (!isAllowedToSee) {
      // The user can't see the event..
      return null;
    }

    return event;
  } else {
    // Redacted by default:
    return null;
  }
}
