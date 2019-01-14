import Intent from "../../authz/intents";
import { AuthenticationError } from "../../error";
import logger from "../../lib/logger";
import { MultichainClient } from "../../multichain";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";
import * as Liststreamkeyitems from "../../multichain/responses/liststreamkeyitems";

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

export async function publish(
  multichain: MultichainClient,
  userId: string,
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
    key: userId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };
  const streamName = usersStreamName;
  const streamItemKey = userId;
  const streamItem = { json: event };

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
    return multichain
      .getRpcClient()
      .invoke("publish", streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "users", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
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
