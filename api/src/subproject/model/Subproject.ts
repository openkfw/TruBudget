import { getAllowedIntents, getUserAndGroups } from "../../authz";
import { onlyAllowedData } from "../../authz/history";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AllowedUserGroupsByIntent, People } from "../../authz/types";
import deepcopy from "../../lib/deepcopy";
import { isNotEmpty } from "../../lib/emptyChecks";
import { inheritDefinedProperties } from "../../lib/inheritDefinedProperties";
import { asMapKey } from "../../multichain/Client";
import { MultichainClient } from "../../multichain/Client.h";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";
import logger from "../../lib/logger";

export interface AugmentedEvent extends Event {
  snapshot: {
    displayName: string;
  };
}

export interface SubprojectResource {
  log: AugmentedEvent[];
  allowedIntents: Intent[];
  data: Data;
}

export interface Data {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  amount: string;
  currency: string;
  exchangeRate: string;
  billingDate: string;
  assignee?: string;
}

export interface RedactedData {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: null;
  description: null;
  amount: null;
  currency: null;
  assignee: null;
  exchangeRate: null;
  billingDate: null;
}

export interface Update {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  exchangeRate?: string;
  billingDate?: string;
}

const subprojectsGroupKey = "subprojects";

function subprojectKey(subprojectId: string): string[] {
  return [subprojectsGroupKey, subprojectId];
}

const redactSubprojectData = (subproject: Data): RedactedData => ({
  id: subproject.id,
  creationUnixTs: subproject.creationUnixTs,
  status: subproject.status,
  displayName: null,
  description: null,
  amount: null,
  currency: null,
  assignee: null,
  exchangeRate: null,
  billingDate: null,
});

export async function publish(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    dataVersion: number; // integer
    data: object;
  },
): Promise<Event> {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: subprojectId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };
  const streamName = projectId;
  const streamItemKey = subprojectKey(subprojectId);
  const streamItem = { json: event };
  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  await multichain.getRpcClient().invoke("publish", streamName, streamItemKey, streamItem);
  return event;
}

export async function get(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId?: string,
  skipAuthorizationCheck?: "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
): Promise<SubprojectResource[]> {
  const queryKey = subprojectId !== undefined ? subprojectId : subprojectsGroupKey;

  const streamItems = await multichain.v2_readStreamItems(projectId, queryKey);
  const userAndGroups = await getUserAndGroups(token);
  const resourceMap = new Map<string, SubprojectResource>();
  const permissionsMap = new Map<string, AllowedUserGroupsByIntent>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    let resource = resourceMap.get(asMapKey(item));
    if (resource === undefined) {
      const result = handleCreate(event);
      if (result === undefined) {
        const message = "Failed to initialize resource";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
      resource = result.resource;
      permissionsMap.set(asMapKey(item), result.permissions);
    } else {
      // We've already encountered this subproject, so we can apply operations on it.
      const permissions = permissionsMap.get(asMapKey(item))!;
      const hasProcessedEvent =
        applyUpdate(event, resource) ||
        applyAssign(event, resource) ||
        applyClose(event, resource) ||
        applyGrantPermission(event, permissions) ||
        applyRevokePermission(event, permissions);
      if (!hasProcessedEvent) {
        const message = "An error occured while processing event";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }

    if (resource !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final resource permissions.
      resource.log.push({
        ...event,
        snapshot: { displayName: deepcopy(resource.data.displayName) },
      });
      resourceMap.set(asMapKey(item), resource);
    }
  }

  for (const [key, permissions] of permissionsMap.entries()) {
    const resource = resourceMap.get(key);
    if (resource !== undefined) {
      resource.allowedIntents = await getAllowedIntents(userAndGroups, permissions);
    }
  }

  const unfilteredResources = [...resourceMap.values()];

  if (
    skipAuthorizationCheck ===
    "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!"
  ) {
    return unfilteredResources;
  }

  // Instead of filtering out subprojects the user is not allowed to see,
  // we simply blank out all fields except the status, which is considered "public".
  const allowedToSeeDataIntent: Intent = "subproject.viewSummary";
  const filteredResources = unfilteredResources.map(resource => {
    const isAllowedToSeeData = resource.allowedIntents.includes(allowedToSeeDataIntent);
    if (!isAllowedToSeeData) resource.data = redactSubprojectData(resource.data) as any;

    // Filter event log according to the user permissions and the type of event:
    resource.log = resource.log
      .map(event => onlyAllowedData(event, resource.allowedIntents) as AugmentedEvent | null)
      .filter(isNotEmpty);

    return resource;
  });

  return filteredResources;
}

function handleCreate(
  event: Event,
): { resource: SubprojectResource; permissions: AllowedUserGroupsByIntent } | undefined {
  if (event.intent !== "project.createSubproject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { subproject, permissions } = event.data;
      return {
        resource: {
          data: deepcopy(subproject),
          log: [], // event is added later
          allowedIntents: [], // is set later using permissionsMap
        },
        permissions: deepcopy(permissions),
      };
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyUpdate(event: Event, resource: SubprojectResource): true | undefined {
  if (event.intent !== "subproject.update") return;
  switch (event.dataVersion) {
    case 1: {
      const update: Update = event.data;
      inheritDefinedProperties(resource.data, update);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyAssign(event: Event, resource: SubprojectResource): true | undefined {
  if (event.intent !== "subproject.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      resource.data.assignee = identity;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyClose(event: Event, resource: SubprojectResource): true | undefined {
  if (event.intent !== "subproject.close") return;
  switch (event.dataVersion) {
    case 1: {
      resource.data.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyGrantPermission(
  event: Event,
  permissions: AllowedUserGroupsByIntent,
): true | undefined {
  if (event.intent !== "subproject.intent.grantPermission") return;
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

function applyRevokePermission(
  event: Event,
  permissions: AllowedUserGroupsByIntent,
): true | undefined {
  if (event.intent !== "subproject.intent.revokePermission") return;
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

export async function getPermissions(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<AllowedUserGroupsByIntent> {
  const streamItems = await multichain.v2_readStreamItems(projectId, subprojectId);
  let permissions: AllowedUserGroupsByIntent | undefined;
  for (const item of streamItems) {
    const event = item.data.json;
    if (permissions === undefined) {
      const result = handleCreate(event);
      if (result !== undefined) {
        permissions = result.permissions;
      } else {
        // skip event
      }
    } else {
      // Permissions has been initialized.
      const _hasProcessedEvent =
        applyGrantPermission(event, permissions) || applyRevokePermission(event, permissions);
    }
  }
  if (permissions === undefined) {
    throw { kind: "NotFound", what: `Subproject ${subprojectId} of project ${projectId}.` };
  }
  return permissions;
}

export async function areAllClosed(
  multichain: MultichainClient,
  projectId: string,
): Promise<boolean> {
  const streamItems = await multichain.v2_readStreamItems(projectId, subprojectsGroupKey);

  type statusType = string;
  const resultMap = new Map<string, statusType>();

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "project.createSubproject": {
        resultMap.set(asMapKey(item), event.data.subproject.status);
        break;
      }
      case "subproject.close": {
        resultMap.set(asMapKey(item), "closed");
        break;
      }
      default: {
        /* ignoring other events */
      }
    }
  }

  // const offendingItems: StreamKey[] = [];
  // for (const [keys, status] of resultMap.entries()) {
  //   if (status !== "closed") offendingItems.push(keys);
  // }

  for (const status of resultMap.values()) {
    if (status !== "closed") return false;
  }
  return true;
}

export async function isClosed(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<boolean> {
  const streamItems = await multichain.v2_readStreamItems(projectId, subprojectId);

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "project.createSubproject": {
        if (event.data.subproject.status === "closed") {
          return true;
        }
        break;
      }
      case "subproject.close": {
        return true;
      }
      default: {
        /* ignoring other events */
      }
    }
  }

  return false;
}
