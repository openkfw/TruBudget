import { AuthenticationError } from "../error";
import logger from "../lib/logger";
import { MultichainClient } from "../multichain/Client.h";
import { Event, throwUnsupportedEventVersion } from "../multichain/event";
import * as Liststreamkeyitems from "../multichain/liststreamkeyitems";

export interface User {
  id: string;
  groups: string[];
}

export function userIdentities({ id, groups }: User): string[] {
  return [id].concat(groups);
}

// depricated

const usersStreamName = "users";

export interface UserRecord {
  id: string;
  displayName: string;
  // The organization the user belongs to:
  organization: string;
  // MultiChain wallet address:
  address: string;
  // MultiChain private key:
  privkey: string;
  // The user's password, hashed:
  passwordDigest: string;
}

export interface UserPublicRecord {
  id: string;
  displayName: string;
  organization: string;
  address: string;
}

export function publicRecord(user: UserRecord): UserPublicRecord {
  return {
    id: user.id,
    displayName: user.displayName,
    organization: user.organization,
    address: user.address,
  };
}

export async function get(multichain: MultichainClient, userId: string): Promise<UserRecord> {
  const users = await multichain.v2_readStreamItems(usersStreamName, userId).then(sourceUsers);
  if (users.length === 0) throw { kind: "AuthenticationError", userId } as AuthenticationError;
  else if (users.length === 1) return users[0];
  else throw Error(`Assertion Error: userId is not unique! id=${userId} result=${users}`);
}

export async function getAll(multichain: MultichainClient): Promise<UserRecord[]> {
  return multichain
    .v2_readStreamItems(usersStreamName, "*")
    .then(sourceUsers)
    .catch(err => {
      if (err.kind === "NotFound" && err.what === "stream users") {
        logger.warn(`The stream users does not exist yet.`);
        return [];
      } else {
        throw err;
      }
    });
}

function sourceUsers(streamItems: Liststreamkeyitems.Item[]): UserRecord[] {
  const userMap = new Map<string, UserRecord>();

  for (const item of streamItems) {
    const event = item.data.json as Event;
    const userId = event.key;

    let user = userMap.get(userId);
    if (user === undefined) {
      user = handleCreate(event);
      if (user === undefined) {
        throw Error(`Failed to initialize user: ${JSON.stringify(event)}.`);
      }
      userMap.set(userId, user);
    } else {
      // additional events would be handled here..
      const hasProcessedEvent = false;
      if (!hasProcessedEvent) {
        const message = "Unexpected event occured";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }
  }

  return [...userMap.values()];
}

function handleCreate(event: Event): UserRecord | undefined {
  if (event.intent !== "global.createUser") return undefined;
  const { data } = event;
  switch (event.dataVersion) {
    case 1: {
      const user: UserRecord = {
        id: data.id,
        displayName: data.displayName,
        organization: data.organization,
        address: data.address,
        privkey: data.privkey,
        passwordDigest: data.passwordDigest,
      };
      return user;
    }
  }
  throwUnsupportedEventVersion(event);
}
