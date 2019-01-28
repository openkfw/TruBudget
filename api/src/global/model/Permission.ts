import { getAllowedIntents } from "../../authz";
import Intent from "../../authz/intents";
import { MultichainClient } from "../../multichain/Client.h";
import { Event } from "../../multichain/event";
import { User, userIdentities } from "../User";

export type Permission = { [key in Intent]?: string[] };

export type Permissions = { [key in Intent]?: string[] };

export function isAllowedToList(permissions: Permissions, actingUser: User): boolean {
  const allowedIntents: Intent[] = ["global.listPermissions"];
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}
export function isAllowedToRevoke(permissions: Permissions, actingUser: User): boolean {
  const allowedIntents: Intent[] = ["global.revokePermission"];
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}

export function isAllowedToGrant(permissions: Permissions, actingUser: User): boolean {
  const allowedIntents: Intent[] = ["global.grantPermission"];
  const userIntents = getAllowedIntents(userIdentities(actingUser), permissions);
  const hasPermission = allowedIntents.some(allowedIntent => userIntents.includes(allowedIntent));
  return hasPermission;
}

export const publish = async (
  multichain: MultichainClient,
  globalstreamName: string,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    data: object;
    dataVersion: number; // integer
  },
): Promise<Event> => {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: "self",
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };

  const streamItemKey = "self";
  const streamItem = { json: event };

  const publishEvent = () => {
    return multichain
      .getRpcClient()
      .invoke("publish", globalstreamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "global", name: globalstreamName })
        .then(() => publishEvent());
    } else {
      throw err;
    }
  });
};
