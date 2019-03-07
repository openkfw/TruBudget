import Intent from "../authz/intents";
import { People, Permissions } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import { asMapKey } from "./Client";
import { ConnToken } from "./conn";
import { Event, throwUnsupportedEventVersion } from "./event";

export * from "./event";

interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

export interface Subproject {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee?: string;
  currency: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: HistoryEvent[];
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
  };
}

export async function getSubprojectList(conn: ConnToken, projectId: string): Promise<Subproject[]> {
  const streamItems = await conn.multichainClient.v2_readStreamItems(projectId, "subprojects");
  const subprojectsByKey = new Map<string, Subproject>();

  for (const item of streamItems) {
    const key = asMapKey(item);
    const event = item.data.json as Event;

    let subproject = subprojectsByKey.get(key);
    if (subproject === undefined) {
      subproject = handleCreate(event);
      if (subproject === undefined) {
        const message = "Failed to initialize resource";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
      subprojectsByKey.set(key, subproject);
    } else {
      const hasProcessedEvent =
        applyUpdate(event, subproject) ||
        applyAssign(event, subproject) ||
        applyClose(event, subproject) ||
        applyGrantPermission(event, subproject) ||
        applyRevokePermission(event, subproject);
      if (!hasProcessedEvent) {
        throw Error(`Unexpected event: ${JSON.stringify(event)}.`);
      }
    }
    subproject.log.push({
      ...event,
      snapshot: { displayName: deepcopy(subproject.displayName) },
    });
  }

  return [...subprojectsByKey.values()];
}

function handleCreate(event: Event): Subproject | undefined {
  if (event.intent !== "project.createSubproject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { subproject, permissions } = event.data;
      return {
        ...deepcopy(subproject),
        permissions: deepcopy(permissions),
        log: [],
      };
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyUpdate(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.update") return;
  switch (event.dataVersion) {
    case 1: {
      inheritDefinedProperties(subproject, event.data);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyAssign(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      subproject.assignee = identity;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyClose(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.close") return;
  switch (event.dataVersion) {
    case 1: {
      subproject.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyGrantPermission(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      grantSubprojectPermission(subproject, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyRevokePermission(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      revokeSubprojectPermission(subproject, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function grantSubprojectPermission(subproject: Subproject, identity: string, intent: Intent) {
  const permissionsForIntent: People = subproject.permissions[intent] || [];
  if (!permissionsForIntent.includes(identity)) {
    permissionsForIntent.push(identity);
  }
  subproject.permissions[intent] = permissionsForIntent;
}

function revokeSubprojectPermission(subproject: Subproject, identity: string, intent: Intent) {
  const permissionsForIntent: People = subproject.permissions[intent] || [];
  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex !== -1) {
    // Remove the user from the array:
    permissionsForIntent.splice(userIndex, 1);
    subproject.permissions[intent] = permissionsForIntent;
  }
}
