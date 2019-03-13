import uuid = require("uuid");

import Intent from "../authz/intents";
import { People, Permissions } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import logger from "../lib/logger";
import * as Cache from "./cache";
import * as Cache2 from "./cache2";
import { asMapKey } from "./Client";
import { RpcMultichainClient } from "./Client.h";
import { ConnToken } from "./conn";
import { Event, throwUnsupportedEventVersion } from "./event";
import { Issuer } from "./issuer";
import { ConnectionSettings } from "./RpcClient.h";
import * as MultichainWorkflowitem from "./Workflowitem";

export * from "./cache";
export * from "./event";
export * from "./Workflowitem";
export * from "./SubprojectEvents";
export * from "./issuer";
export * from "./ProjectEvents";
export * from "./SubprojectEvents";
export { ConnToken } from "./conn";

const workflowitemsGroupKey = subprojectId => `${subprojectId}_workflows`;
const workflowitemOrderingKey = subprojectId => `${subprojectId}_workflowitem_ordering`;
const globalSelfKey = "self";

type ResourceType = "project" | "subproject" | "workflowitem";

interface NotificationResourceDescription {
  id: string;
  type: ResourceType;
}

export function init(rpcSettings: ConnectionSettings): ConnToken {
  const multichainClient = new RpcMultichainClient(rpcSettings);
  return {
    multichainClient,
    cache: Cache.initCache(),
    cache2: Cache2.initCache(),
  };
}

export async function getGlobalPermissionList(conn: ConnToken): Promise<Permissions> {
  try {
    const streamItems = await conn.multichainClient.v2_readStreamItems("global", globalSelfKey, 1);
    if (streamItems.length < 1) {
      return {};
    }
    const event: Event = streamItems[0].data.json;
    return event.data.permissions;
  } catch (err) {
    if (err.kind === "NotFound") {
      // Happens at startup, no need to worry...
      logger.debug("Global permissions not found. Happens at startup.");
      return {};
    } else {
      logger.error({ error: err }, "Error while retrieving global permissions");
      throw err;
    }
  }
}

export async function grantGlobalPermission(
  conn: ConnToken,
  issuer: Issuer,
  grantee: string,
  intent: Intent,
): Promise<void> {
  const permissions = await getGlobalPermissionList(conn);
  const permissionsForIntent: People = permissions[intent] || [];
  permissionsForIntent.push(grantee);
  permissions[intent] = permissionsForIntent;

  const grantintent: Intent = "global.grantPermission";
  const streamItemKey = globalSelfKey;

  const event = {
    key: streamItemKey,
    intent: grantintent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    data: { permissions },
    dataVersion: 1,
  };

  const streamName = "global";
  const streamItem = { json: event };

  logger.debug(`Publishing ${grantintent} to ${streamName}/${streamItemKey}`);

  const publishEvent = () => {
    return conn.multichainClient
      .getRpcClient()
      .invoke("publish", streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      return conn.multichainClient
        .getOrCreateStream({ kind: "global", name: streamName })
        .then(() => publishEvent());
    } else {
      throw err;
    }
  });
}

export async function revokeGlobalPermission(
  conn: ConnToken,
  issuer: Issuer,
  recipient: string,
  intent: Intent,
): Promise<void> {
  const permissions = await getGlobalPermissionList(conn);
  if (permissions === {}) {
    return;
  }
  const permissionsForIntent: People = permissions[intent] || [];
  const userIndex = permissionsForIntent.indexOf(recipient);
  permissionsForIntent.splice(userIndex, 1);
  permissions[intent] = permissionsForIntent;

  const revokeIntent: Intent = "global.revokePermission";
  const streamItemKey = globalSelfKey;

  const event = {
    key: streamItemKey,
    intent: revokeIntent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    data: { permissions },
    dataVersion: 1,
  };

  const streamName = "global";
  const streamItem = { json: event };

  logger.debug(`Publishing ${revokeIntent} to ${streamName}/${streamItemKey}`);

  const publishEvent = () => {
    return conn.multichainClient
      .getRpcClient()
      .invoke("publish", streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      // stream does not exist yet. Return without revoking permission
      return;
    } else {
      throw err;
    }
  });
}

export async function issueNotification(
  conn: ConnToken,
  issuer: Issuer,
  message: Event,
  recipient: string,
  resources: NotificationResourceDescription[],
): Promise<void> {
  const notificationId = uuid();
  // TODO message.key is working for projects
  // TODO but we need to access projectId subprojectid and workflowitemid and build data.resources
  // const projectId = message.key;
  // const resources: NotificationResourceDescription[] = [
  //   {
  //     id: projectId,
  //     type: notificationTypeFromIntent(message.intent),
  //   },
  // ];
  const intent = "notification.create";
  const event: Event = {
    key: recipient,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {
      notificationId,
      resources,
      isRead: false,
      originalEvent: message,
    },
  };
  const streamName = "notifications";
  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${recipient}`);
    return conn.multichainClient.getRpcClient().invoke("publish", streamName, recipient, {
      json: event,
    });
  };
  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return conn.multichainClient
        .getOrCreateStream({ kind: "notifications", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

function notificationTypeFromIntent(intent: Intent): ResourceType {
  if (intent.startsWith("project.") || intent === "global.createProject") {
    return "project";
  } else if (intent.startsWith("subproject.") || intent === "project.createSubproject") {
    return "subproject";
  } else if (intent.startsWith("workflowitem.") || intent === "subproject.createWorkflowitem") {
    return "workflowitem";
  } else {
    throw Error(`Unknown ResourceType for intent ${intent}`);
  }
}

export function generateResources(
  projectId: string,
  subprojectId?: string,
  workflowitemId?: string,
): NotificationResourceDescription[] {
  const notificationResource: NotificationResourceDescription[] = [];
  if (!projectId) {
    throw { kind: "PreconditionError", message: "No project ID provided" };
  }
  notificationResource.push({
    id: projectId,
    type: "project",
  });
  if (subprojectId) {
    notificationResource.push({
      id: subprojectId,
      type: "subproject",
    });
  }
  if (workflowitemId) {
    notificationResource.push({
      id: workflowitemId,
      type: "workflowitem",
    });
  }

  return notificationResource;
}

export async function getWorkflowitemList(
  conn: ConnToken,
  projectId: string,
  subprojectId: string,
): Promise<MultichainWorkflowitem.Workflowitem[]> {
  const queryKey = workflowitemsGroupKey(subprojectId);

  const streamItems = await conn.multichainClient.v2_readStreamItems(projectId, queryKey);
  const workflowitemsMap = new Map<string, MultichainWorkflowitem.Workflowitem>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    // Events look differently for different intents!
    let workflowitem = workflowitemsMap.get(asMapKey(item));

    if (workflowitem === undefined) {
      // If we didn't encounter the workflowitem while looping we just need to create
      // a workflowitem with no data in it
      workflowitem = MultichainWorkflowitem.handleCreate(event);

      if (workflowitem === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
    } else {
      // We've already encountered this workflowitem, so we can apply operations on it.
      const hasProcessedEvent =
        MultichainWorkflowitem.applyUpdate(event, workflowitem) ||
        MultichainWorkflowitem.applyAssign(event, workflowitem) ||
        MultichainWorkflowitem.applyClose(event, workflowitem) ||
        MultichainWorkflowitem.applyGrantPermission(event, workflowitem) ||
        MultichainWorkflowitem.applyRevokePermission(event, workflowitem);
      if (!hasProcessedEvent) {
        const message = "Unexpected event occured";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }

    if (workflowitem !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final workflowitem permissions.
      workflowitem.log.push({
        ...event,
        snapshot: {
          displayName: deepcopy(workflowitem.displayName),
          amount: deepcopy(workflowitem.amount)!,
          currency: deepcopy(workflowitem.currency)!,
          amountType: deepcopy(workflowitem.amountType),
        },
      });
      workflowitemsMap.set(asMapKey(item), workflowitem);
    }
  }

  return [...workflowitemsMap.values()];
}

export async function getWorkflowitemOrdering(
  conn: ConnToken,
  projectId: string,
  subprojectId: string,
): Promise<string[]> {
  // Currently, the workflowitem ordering is stored in full; therefore, we only
  // need to retrieve the latest item(see`publishWorkflowitemOrdering`).
  const expectedDataVersion = 1;
  const nValues = 1;

  const streamItems = await conn.multichainClient
    .v2_readStreamItems(projectId, workflowitemOrderingKey(subprojectId), nValues)
    .then(items => {
      if (items.length > 0) return items;
      else throw { kind: "NotFound", what: workflowitemOrderingKey(subprojectId) };
    })
    .catch(err => {
      if (err.kind === "NotFound") {
        return [{ data: { json: { dataVersion: 1, data: [] } } }];
      } else {
        throw err;
      }
    });

  const item = streamItems[0];
  const event = item.data.json as Event;
  if (event.dataVersion !== expectedDataVersion) {
    throwUnsupportedEventVersion(event);
  }

  const ordering: string[] = event.data;
  return ordering;
}

export function closeWorkflowitem(
  conn: ConnToken,
  issuer: Issuer,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<void> {
  const intent: Intent = "workflowitem.close";

  const event = {
    key: workflowitemId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {},
  };

  const streamName = projectId;
  const streamItemKey = [workflowitemsGroupKey(subprojectId), workflowitemId];
  const streamItem = { json: event };

  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  return conn.multichainClient
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export function updateWorkflowitem(
  conn: ConnToken,
  issuer: Issuer,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  data: MultichainWorkflowitem.Update,
): Promise<void> {
  const intent: Intent = "workflowitem.update";

  const event = {
    key: workflowitemId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data,
  };

  const streamName = projectId;
  const streamItemKey = [workflowitemsGroupKey(subprojectId), workflowitemId];
  const streamItem = { json: event };

  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  return conn.multichainClient
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export function assignWorkflowitem(
  conn: ConnToken,
  issuer: Issuer,
  newAssignee: string,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<void> {
  const intent: Intent = "workflowitem.assign";

  const event = {
    key: workflowitemId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {
      identity: newAssignee,
    },
  };

  const streamName = projectId;
  const streamItemKey = [workflowitemsGroupKey(subprojectId), workflowitemId];
  const streamItem = { json: event };

  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  return conn.multichainClient
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}
