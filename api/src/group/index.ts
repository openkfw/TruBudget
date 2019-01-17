import Intent from "../authz/intents";
import deepcopy from "../lib/deepcopy";
import { isEmpty } from "../lib/emptyChecks";
import logger from "../lib/logger";
import { MultichainClient } from "../multichain";
import { Event, throwUnsupportedEventVersion } from "../multichain/event";
import * as Liststreamkeyitems from "../multichain/responses/liststreamkeyitems";

const groupsStreamName = "groups";

export interface GroupResource {
  groupId: string;
  displayName: string;
  users: string[];
}

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  logger.debug({ multichain }, "Checking if stream exists.");
  await multichain.getOrCreateStream({
    kind: "groups",
    name: groupsStreamName,
  });
};

export const groupExists = async (multichain, groupId) => {
  await ensureStreamExists(multichain);
  const existingGroups = await getAll(multichain);
  const exists = existingGroups.find(existingGroup => existingGroup.groupId === groupId);
  logger.debug(`Group ${groupId} ${exists ? "exists." : "does not exist."}`);
  return exists ? true : false;
};

const handleCreate = (event: Event): { resource: GroupResource } | undefined => {
  if (event.intent !== "global.createGroup") {
    return undefined;
  }
  switch (event.dataVersion) {
    case 1: {
      const { group } = event.data;
      return {
        resource: {
          ...deepcopy(group),
        },
      };
    }
  }
  throwUnsupportedEventVersion(event);
};

export const publish = async (
  multichain: MultichainClient,
  groupId: string,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    data: object;
    dataVersion: number; // integer
  },
) => {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: groupId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };

  const streamItemKey = groupId;
  const streamItem = { json: event };

  await ensureStreamExists(multichain);

  const publishEvent = () => {
    logger.info(`Publishing ${event.intent} to ${groupsStreamName}/${streamItemKey}`);
    return multichain
      .getRpcClient()
      .invoke("publish", groupsStreamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      logger.debug(
        `The stream ${groupsStreamName} does not exist yet. Creating the stream and trying again.`,
      );
      return multichain
        .getOrCreateStream({ kind: "groups", name: groupsStreamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: { err, groupsStreamName } }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
};

export const getGroupsForUser = async (
  multichain: MultichainClient,
  userId: string,
): Promise<GroupResource[]> => {
  const groups = await getAll(multichain);
  return groups.filter(group => group.users.includes(userId));
};

export const getUsersForGroup = async (
  multichain: MultichainClient,
  groupId: string,
): Promise<string[]> => {
  let users: string[] = [];
  if (!isEmpty(groupId)) {
    const group = await getGroup(multichain, groupId);
    users = group.users;
  }
  return users;
};

async function fetchStreamItems(multichain: MultichainClient): Promise<Liststreamkeyitems.Item[]> {
  return multichain.v2_readStreamItems("groups", "*");
}
export const asMapKey = (keys: string[]): string => keys.join();

const mapItems = (streamItems: Liststreamkeyitems.Item[]): Map<string, GroupResource> => {
  const resourceMap = new Map<string, GroupResource>();
  for (const item of streamItems) {
    const event = item.data.json as Event;
    let resource = resourceMap.get(asMapKey(item.keys));
    if (resource === undefined) {
      const result = handleCreate(event);
      if (result === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
      resource = result.resource;
      resourceMap.set(asMapKey(item.keys), resource);
    } else {
      // Since we've a group now, we can add/remove Users
      const hasProcessedEvent = addUser(event, resource) || removeUser(event, resource);
      if (!hasProcessedEvent) {
        throw Error(`I don't know how to handle this event: ${JSON.stringify(event)}.`);
      }
    }
  }
  return resourceMap;
};
export const getAll = async (multichain: MultichainClient): Promise<GroupResource[]> => {
  await ensureStreamExists(multichain);
  const streamItems = await fetchStreamItems(multichain);
  const resourceMap = mapItems(streamItems);
  const groups = [...resourceMap.values()];
  return groups;
};

export const getGroup = async (multichain: MultichainClient, groupId: string) => {
  await ensureStreamExists(multichain);
  const groupEvents = await multichain.v2_readStreamItems("groups", groupId);
  const resourceMap = mapItems(groupEvents);
  return resourceMap.values().next().value;
};

function addUser(event: Event, resource: GroupResource): true | undefined {
  if (event.intent !== "group.addUser") {
    return;
  }
  switch (event.dataVersion) {
    case 1: {
      logger.debug(
        `Building up group: Adding user ${event.data.userId} to group ${resource.displayName}.`,
      );
      resource.users.push(event.data.userId);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}
function removeUser(event: Event, resource: GroupResource): true | undefined {
  if (event.intent !== "group.removeUser") {
    return;
  }
  switch (event.dataVersion) {
    case 1: {
      const index = resource.users.indexOf(event.data.userId);
      if (index > -1) {
        resource.users.splice(index, 1);
      }
      logger.debug(
        `Building up group: Removing user ${event.data.userId} from group ${resource.displayName}.`,
      );
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}
