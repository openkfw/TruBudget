import { getAllowedIntents } from "../authz";
import { isAllowedToSeeEvent } from "../authz/history";
import { getUserAndGroups } from "../authz/index";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import { asMapKey } from "../multichain/Client";
import { MultichainClient } from "../multichain/Client.h";

const workflowitemsGroupKey = subprojectId => `${subprojectId}_workflows`;

const workflowitemKey = (subprojectId, workflowitemId) => [
  workflowitemsGroupKey(subprojectId),
  workflowitemId,
];

const deepcopy = (x: any): any => JSON.parse(JSON.stringify(x));

interface Event {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
}

const throwUnsupportedEventVersion = (event: Event): never => {
  throw { kind: "UnsupportedEventVersion", event };
};

export interface WorkflowitemResource {
  log: Event[];
  allowedIntents: Intent[];
  data: Data;
}

export interface Data {
  id: string;
  creationUnixTs: string;
  displayName: string;
  amount: string;
  currency: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  assignee?: string;
  documents: Document[];
}

export interface ObscuredData {
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
}

export interface Document {
  description: string;
  hash: string;
}

const redactWorkflowitemData = (workflowitem: Data): ObscuredData => ({
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
});

export const publish = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  intent: Intent,
  createdBy: string,
  creationTimestamp: Date,
  dataVersion: number, // integer
  data: object,
): Promise<void> => {
  const event: Event = {
    key: workflowitemId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };
  return multichain
    .getRpcClient()
    .invoke("publish", projectId, workflowitemKey(subprojectId, workflowitemId), {
      json: event,
    });
};

export const get = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId?: string,
): Promise<WorkflowitemResource[]> => {
  const queryKey =
    workflowitemId !== undefined ? workflowitemId : workflowitemsGroupKey(subprojectId);

  const streamItems = await multichain.v2_readStreamItems(projectId, queryKey);
  const userAndGroups = await getUserAndGroups(token);
  const resourceMap = new Map<string, WorkflowitemResource>();
  const permissionsMap = new Map<string, AllowedUserGroupsByIntent>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    let resource = resourceMap.get(asMapKey(item));
    if (resource === undefined) {
      const result = handleCreate(event);
      if (result === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
      resource = result.resource;
      permissionsMap.set(asMapKey(item), result.permissions);
    } else {
      // We've already encountered this workflowitem, so we can apply operations on it.
      const permissions = permissionsMap.get(asMapKey(item))!;
      const hasProcessedEvent =
        applyAssign(event, resource) ||
        applyClose(event, resource) ||
        applyGrantPermission(event, permissions) ||
        applyRevokePermission(event, permissions);
      if (!hasProcessedEvent) {
        throw Error(`I don't know how to handle this event: ${JSON.stringify(event)}.`);
      }
    }

    if (resource !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final resource permissions.
      resource.log.push(event);
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

  // Instead of filtering out workflowitems the user is not allowed to see,
  // we simply blank out all fields except the status, which is considered "public".
  const allowedToSeeDataIntent: Intent = "workflowitem.view";
  const filteredResources = unfilteredResources.map(resource => {
    // Redact data if the user is not allowed to view it:
    const isAllowedToSeeData = resource.allowedIntents.includes(allowedToSeeDataIntent);
    if (!isAllowedToSeeData) resource.data = redactWorkflowitemData(resource.data) as any;

    // Filter event log according to the user permissions and the type of event:
    resource.log = resource.log.filter(event =>
      isAllowedToSeeEvent(resource.allowedIntents, event.intent),
    );

    return resource;
  });

  return filteredResources;
};

const handleCreate = (
  event: Event,
): { resource: WorkflowitemResource; permissions: AllowedUserGroupsByIntent } | undefined => {
  if (event.intent !== "subproject.createWorkflowitem") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { workflowitem, permissions } = event.data;
      return {
        resource: {
          data: deepcopy(workflowitem),
          log: [], // event is added below, right before updating the map
          allowedIntents: [], // is set later using permissionsMap
        },
        permissions: deepcopy(permissions),
      };
    }
  }
  throwUnsupportedEventVersion(event);
};

const applyAssign = (event: Event, resource: WorkflowitemResource): true | undefined => {
  if (event.intent !== "workflowitem.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { userId } = event.data;
      resource.data.assignee = userId;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
};

const applyClose = (event: Event, resource: WorkflowitemResource): true | undefined => {
  if (event.intent !== "workflowitem.close") return;
  switch (event.dataVersion) {
    case 1: {
      resource.data.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
};

const applyGrantPermission = (
  event: Event,
  permissions: AllowedUserGroupsByIntent,
): true | undefined => {
  if (event.intent !== "workflowitem.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { userId, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      if (!permissionsForIntent.includes(userId)) {
        permissionsForIntent.push(userId);
      }
      permissions[intent] = permissionsForIntent;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
};

const applyRevokePermission = (
  event: Event,
  permissions: AllowedUserGroupsByIntent,
): true | undefined => {
  if (event.intent !== "workflowitem.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { userId, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      const userIndex = permissionsForIntent.indexOf(userId);
      if (userIndex !== -1) {
        // Remove the user from the array:
        permissionsForIntent.splice(userIndex, 1);
        permissions[intent] = permissionsForIntent;
      }
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
};

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
): Promise<AllowedUserGroupsByIntent> => {
  const streamItems = await multichain.v2_readStreamItems(projectId, workflowitemId);
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
    throw { kind: "NotFound", what: `Workflowitem ${workflowitemId} of project ${projectId}.` };
  }
  return permissions;
};

export const areAllClosed = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<boolean> => {
  const streamItems = await multichain.v2_readStreamItems(
    projectId,
    workflowitemsGroupKey(subprojectId),
  );

  type statusType = string;
  const resultMap = new Map<string, statusType>();

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "subproject.createWorkflowitem": {
        resultMap.set(asMapKey(item), event.data.workflowitem.status);
        break;
      }
      case "workflowitem.close": {
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
};
