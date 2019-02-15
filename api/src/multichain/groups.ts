import * as Multichain from ".";
import deepcopy from "../lib/deepcopy";
import { isEmpty } from "../lib/emptyChecks";
import logger from "../lib/logger";
import { MultichainClient } from "./Client.h";
import { ConnToken } from "./conn";
import * as Liststreamkeyitems from "./liststreamkeyitems";

//
// public
//

export function getUsers(conn: ConnToken, groupId: string): Promise<string[]> {
  if (isEmpty(groupId)) return Promise.resolve([]);
  return getGroup(conn.multichainClient, groupId)
    .then(group => group.users)
    .catch(_ => []);
}

export async function addUser(
  multichain: MultichainClient,
  groupId: string,
  userId: string,
): Promise<string[]> {
  throw Error("not implemented");
}

export async function removeUser(
  multichain: MultichainClient,
  groupId: string,
  userId: string,
): Promise<string[]> {
  throw Error("not implemented");
}

//
// private
//

interface Group {
  groupId: string;
  displayName: string;
  users: string[];
}

async function getGroup(multichain: MultichainClient, groupId: string): Promise<Group> {
  await ensureStreamExists(multichain);
  const groupEvents = await multichain.v2_readStreamItems("groups", groupId);
  const resourceMap = mapItems(groupEvents);
  return resourceMap.values().next().value;
}

function ensureStreamExists(multichain: MultichainClient): Promise<void> {
  return multichain.getOrCreateStream({
    kind: "groups",
    name: "groups",
  });
}

function asMapKey(keys: string[]): string {
  return keys.join();
}

function mapItems(streamItems: Liststreamkeyitems.Item[]): Map<string, Group> {
  const resourceMap = new Map<string, Group>();
  for (const item of streamItems) {
    const event = item.data.json as Multichain.Event;
    let resource = resourceMap.get(asMapKey(item.keys));
    if (resource === undefined) {
      const result = applyCreate(event);
      if (result === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
      resource = result.resource;
      resourceMap.set(asMapKey(item.keys), resource);
    } else {
      // Since we've a group now, we can add/remove Users
      const hasProcessedEvent = applyAddUser(event, resource) || applyRemoveUser(event, resource);
      if (!hasProcessedEvent) {
        throw Error(`I don't know how to handle this event: ${JSON.stringify(event)}.`);
      }
    }
  }
  return resourceMap;
}

function applyCreate(event: Multichain.Event): { resource: Group } | undefined {
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
  Multichain.throwUnsupportedEventVersion(event);
}

function applyAddUser(event: Multichain.Event, resource: Group): true | undefined {
  if (event.intent !== "group.addUser") {
    return;
  }
  switch (event.dataVersion) {
    case 1: {
      logger.trace(
        `Building up group: Adding user ${event.data.userId} to group ${resource.displayName}.`,
      );
      resource.users.push(event.data.userId);
      return true;
    }
  }
  Multichain.throwUnsupportedEventVersion(event);
}

function applyRemoveUser(event: Multichain.Event, resource: Group): true | undefined {
  if (event.intent !== "group.removeUser") {
    return;
  }
  switch (event.dataVersion) {
    case 1: {
      const index = resource.users.indexOf(event.data.userId);
      if (index > -1) {
        resource.users.splice(index, 1);
      }
      logger.trace(
        `Building up group: Removing user ${event.data.userId} from group ${resource.displayName}.`,
      );
      return true;
    }
  }
  Multichain.throwUnsupportedEventVersion(event);
}
