import { AuthToken } from "../authz/token";
import { MultichainClient } from "../multichain";
import { Event, throwUnsupportedEventVersion } from "../multichain/event";
import Intent from "../authz/intents";
import * as Liststreamkeyitems from "../multichain/responses/liststreamkeyitems";
import deepcopy from "../lib/deepcopy";

const groupsStreamName = "groups";

export interface GroupResource {
  groupId: string;
  displayName: string;
  users: string[];
}

export interface GroupRecord {
  groupId: string;
  displayName: string;
  users: Array<string>;
}

const ensureStreamExists = async (multichain: MultichainClient): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "groups",
    name: groupsStreamName,
  });
};

export const groupExists = async (multichain, groupId) => {
  await ensureStreamExists(multichain);
  const existingGroups = await getAll(multichain);
  const exists = existingGroups.find(existingGroup => existingGroup.groupId === groupId);
  return exists ? true : false;
};

const handleCreate = (event: Event): { resource: GroupResource } | undefined => {
  if (event.intent !== "global.createGroup") return undefined;
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
    data: Object;
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

  const streamItemKey = ["groups", groupId];
  const streamItem = { json: event };

  await ensureStreamExists(multichain);

  const publishEvent = () => {
    console.log(
      `Publishing ${event.intent} to ${groupsStreamName}/${JSON.stringify(streamItemKey)}`,
    );
    return multichain
      .getRpcClient()
      .invoke("publish", groupsStreamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "groups", name: groupsStreamName })
        .then(() => publishEvent());
    } else {
      throw err;
    }
  });
};

// export const get = async (multichain: MultichainClient, groupId: string): Promise<GroupRecord> => {
//   const streamItem = await multichain.getValue(groupsStreamName, groupId);
//   return streamItem.resource.data;
// };

export const getGroupsForUser = async (multichain: MultichainClient, userId: string) => {
  const groups = await getAll(multichain);
  const acc: Object[] = [];

  return groups.reduce((acc, group) => {
    //   { groupId: 'xxxxxx',
    // displayName: 'test',
    // users: [ 'mstein', 'jxavier' ] }
    const index = group.users.findIndex(user => user === userId);
    if (index > -1) {
      acc.push({ displayName: group.displayName, id: group.groupId });
    }
    return acc;
  }, acc);
};

async function fetchStreamItems(multichain: MultichainClient): Promise<Liststreamkeyitems.Item[]> {
  return multichain.v2_readStreamItems("groups", "groups");
}
export const asMapKey = (keys: String[]): string => keys.join();

export const getAll = async (multichain: MultichainClient): Promise<GroupResource[]> => {
  const resourceMap = new Map<string, GroupResource>();
  await ensureStreamExists(multichain);
  const streamItems = await fetchStreamItems(multichain);
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
      if (event.intent === "group.addUser") {
        resource.users.push(event.data.userId);
      } else if (event.intent === "group.removeUser") {
        const index = resource.users.indexOf(event.data.userId);
        if (index > -1) {
          resource.users.splice(index, 1);
        }
      }
    }
  }
  const groups = [...resourceMap.values()];
  return groups;
};
