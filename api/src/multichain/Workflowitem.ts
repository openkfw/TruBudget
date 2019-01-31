import { Event, throwUnsupportedEventVersion } from ".";
import Intent from "../authz/intents";
import { People, Permissions } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";

const maxItemCount: number = 0x7fffffff;

export interface Document {
  id: string;
  hash: string;
}

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

export interface Update {
  displayName?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  description?: string;
  documents?: Document[];
  exchangeRate?: string;
  billingDate?: string;
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
  permissions: Permissions;
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

export interface User {
  id: string;
  groups: string[];
}

export function userIdentities({ id, groups }: User): string[] {
  return [id].concat(groups);
}

export function applyUpdate(event: Event, workflowitem: Workflowitem): true | undefined {
  if (event.intent !== "workflowitem.update") return;
  switch (event.dataVersion) {
    case 1: {
      if (event.data.documents) {
        const currentDocs = workflowitem.documents || [];
        const currentIds = currentDocs.map(doc => doc.id);
        const newDocs = event.data.documents.filter(doc => !currentIds.includes(doc.id));
        if (workflowitem.documents) {
          workflowitem.documents.push(...newDocs);
        } else {
          workflowitem.documents = newDocs;
        }
        delete event.data.documents;
      }
      const update: Update = event.data;

      inheritDefinedProperties(workflowitem, update);
      // In case the update has set the amountType to N/A, we don't want to retain the
      // amount and currency fields:
      if (workflowitem.amountType === "N/A") {
        delete workflowitem.amount;
        delete workflowitem.currency;
      }

      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export function applyAssign(event: Event, workflowitem: Workflowitem): true | undefined {
  if (event.intent !== "workflowitem.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      workflowitem.assignee = identity;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export function applyClose(event: Event, workflowitem: Workflowitem): true | undefined {
  if (event.intent !== "workflowitem.close") return;
  switch (event.dataVersion) {
    case 1: {
      workflowitem.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export function applyGrantPermission(event: Event, permissions: Permissions): true | undefined {
  if (event.intent !== "workflowitem.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      if (!permissionsForIntent.includes(identity)) {
        permissionsForIntent.push(identity);
      }
      permissions[intent] = permissionsForIntent;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export function applyRevokePermission(event: Event, permissions: Permissions): true | undefined {
  if (event.intent !== "workflowitem.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      const userIndex = permissionsForIntent.indexOf(identity);
      if (userIndex !== -1) {
        // Remove the user from the array:
        permissionsForIntent.splice(userIndex, 1);
        permissions[intent] = permissionsForIntent;
      }
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export function handleCreate(event: Event): Workflowitem | undefined {
  if (event.intent !== "subproject.createWorkflowitem") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { workflowitem, permissions } = event.data;
      const values = { ...deepcopy(workflowitem), permissions: deepcopy(permissions), log: [] };
      return values as Workflowitem;
    }
  }
  throwUnsupportedEventVersion(event);
}
