import VError from "verror";
import Intent from "../authz/intents";
import { People, Permissions } from "../authz/types";
import { TruBudgetError } from "../error";
import logger from "../lib/logger";
import * as Cache from "./cache";
import * as Cache2 from "./cache2";
import { RpcMultichainClient } from "./Client.h";
import { ConnToken } from "./conn";
import { Event, throwUnsupportedEventVersion } from "./event";
import { Issuer } from "./issuer";
import { ConnectionSettings } from "./RpcClient.h";

export { ConnToken } from "./conn";
export * from "./event";
export * from "./issuer";
export * from "./ProjectEvents";

const workflowitemsGroupKey = (subprojectId): string => `${subprojectId}_workflows`;
const workflowitemOrderingKey = (subprojectId): string => `${subprojectId}_workflowitem_ordering`;
const globalSelfKey = "self";

interface Update {
  displayName?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  description?: string;
  documents?: Document[];
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
}
interface Document {
  id: string;
  hash: string;
  fileName?: string;
}

export function init(rpcSettings: ConnectionSettings): ConnToken {
  logger.debug({ rpcSettings }, "Initialising RpcMultichainClient with rpcSettings");

  const multichainClient = new RpcMultichainClient(rpcSettings);

  return {
    multichainClient,
    cache: Cache.initCache(),
    cache2: Cache2.initCache(),
  };
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishEvent = (): any => {
    return conn.multichainClient
      .getRpcClient()
      .invokePublish(streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch((err) => {
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
  logger.debug({ intent, recipient }, "Revoking global permission");
  const permissions = await getGlobalPermissionList(conn);

  if (Object.keys(permissions).length == 0) {
    throw new VError("No global permissions found, escaping");
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const publishEvent = (): any => {
    return conn.multichainClient
      .getRpcClient()
      .invokePublish(streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch((err) => {
    if (err.code === -708) {
      // stream does not exist yet. Return without revoking permission
      return;
    } else {
      throw err;
    }
  });
}

async function getGlobalPermissionList(conn: ConnToken): Promise<Permissions> {
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
    }

    logger.error({ err }, "Error while retrieving global permissions");
    throw err;
  }
}

export async function getWorkflowitemOrdering(
  conn: ConnToken,
  projectId: string,
  subprojectId: string,
): Promise<string[]> {
  logger.debug({ projectId, subprojectId }, "Getting order of workflowitems");
  // Currently, the workflowitem ordering is stored in full; therefore, we only
  // need to retrieve the latest item(see`publishWorkflowitemOrdering`).
  const expectedDataVersion = 1;
  const nValues = 1;

  const streamItems = await conn.multichainClient
    .v2_readStreamItems(projectId, workflowitemOrderingKey(subprojectId), nValues)
    .then((items) => {
      if (items.length > 0) return items;
      else
        throw new TruBudgetError({
          kind: "NotFound",
          what: { key: workflowitemOrderingKey(subprojectId) },
        });
    })
    .catch((err) => {
      logger.error({ err }, "Error while getting order of workflowitems");

      if (err.kind === "NotFound") {
        return [{ data: { json: { dataVersion: 1, data: [] } } }];
      }

      throw err;
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
    .invokePublish(streamName, streamItemKey, streamItem)
    .then(() => event);
}

export function updateWorkflowitem(
  conn: ConnToken,
  issuer: Issuer,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  data: Update,
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
    .invokePublish(streamName, streamItemKey, streamItem)
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
    .invokePublish(streamName, streamItemKey, streamItem)
    .then(() => event);
}
