import { AuthToken } from "../authz/token";
import { MultichainClient } from "../multichain";
import { Event, throwUnsupportedEventVersion } from "../multichain/event";
import Intent from "../authz/intents";
import * as Liststreamkeyitems from "../multichain/responses/liststreamkeyitems";
import deepcopy from "../lib/deepcopy";

const groupsStreamName = "groups";

export interface GroupResource {
  data: Object;
  log: Array<Object>;
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
  const existingGroups = await getAll(multichain);
  const exists = existingGroups.find(existingGroup => existingGroup.data.groupId === groupId);
  return exists;
};

const handleCreate = (event: Event): { resource: GroupResource } | undefined => {
  if (event.intent !== "global.createGroup") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { group } = event.data;
      return {
        resource: {
          data: deepcopy(group),
          log: [], // event is added later
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

async function fetchStreamItems(multichain: MultichainClient): Promise<Liststreamkeyitems.Item[]> {
  return multichain.v2_readStreamItems("groups", "groups");
}
export const asMapKey = (keys: String[]): string => keys.join();

export const getAll = async (multichain: MultichainClient): Promise<GroupResource[]> => {
  const resourceMap = new Map<string, GroupResource>();
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
        resource.data.users.push(event.data.userId);
      }
      // else if (event.intent === )
    }
  }
  console.log(resourceMap);
  const groups = [...resourceMap.values()];
  return groups;
  // const streamItems = await multichain.getLatestValues(groupsStreamName, "groups");
  // console.log(streamItems);
  // return streamItems.map(item => item.resource.data);
};
