import { getAllowedIntents } from "../../authz";
import Intent from "../../authz/intents";
import { MultichainClient } from "../../multichain/Client.h";
import { Event } from "../../multichain/event";
import { User, userIdentities } from "../User";

export type Permissions = { [key in Intent]?: string[] };

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
