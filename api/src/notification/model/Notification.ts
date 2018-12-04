import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import deepcopy from "../../lib/deepcopy";
import logger from "../../lib/logger";
import { ResourceType } from "../../lib/resourceTypes";
import { MultichainClient } from "../../multichain";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";
import * as Liststreamkeyitems from "../../multichain/responses/liststreamkeyitems";

const streamName = "notifications";

export type NotificationId = string;

export interface NotificationResourceDescription {
  id: string;
  type: ResourceType;
}

export interface EventData {
  notificationId: NotificationId;
  resources: NotificationResourceDescription[];
  isRead: boolean;
  originalEvent: Event;
}

export interface Notification {
  notificationId: NotificationId;
  resources: NotificationResourceDescription[];
  isRead: boolean;
  originalEvent: Event;
}

export interface NotificationList {
  notificationCount: number;
  notifications: Notification[];
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
): Promise<void> {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: userId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${userId}`);
    return multichain.getRpcClient().invoke("publish", streamName, userId, {
      json: event,
    });
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.warn(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "notifications", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

export async function get(
  multichain: MultichainClient,
  token: AuthToken,
  beforeId?: string,
  afterId?: string,
  limit?: string,
): Promise<NotificationList> {
  const streamItems: Liststreamkeyitems.Item[] = await multichain
    .v2_readStreamItems(streamName, token.userId)
    .catch(err => {
      if (err.kind === "NotFound" && err.what === "stream notifications") {
        logger.warn(`The stream ${streamName} does not exist yet.`);
        // The stream does not exist yet, which happens on (freshly installed) systems that
        // have not seen any notifications yet.
        return [];
      } else {
        logger.error({ error: err }, `Getting stream ${streamName} failed.`);
        throw err;
      }
    });
  const notificationsById = new Map<NotificationId, Notification>();
  for (const streamItem of streamItems) {
    const event = streamItem.data.json as Event;

    const notificationId = getNotificationId(event);

    let notification = notificationsById.get(notificationId);
    if (notification === undefined) {
      notification = handleCreate(event);
      // We ignore that this might fail, because the event could relate to a notification
      // that has already been skipped.
    } else {
      // We've already encountered this notification, so we can apply operations on it.
      const hasProcessedEvent = applyMarkRead(event, notification);
      if (!hasProcessedEvent) {
        const message = "Unexpected event occured";
        logger.error({ event }, message);
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }

    if (notification !== undefined) {
      notificationsById.set(notificationId, notification);
    }
  }

  const unorderedNotifications = [...notificationsById.values()];

  const orderedNotifiactions = unorderedNotifications.sort(compareNotifications);

  const afterIndex = orderedNotifiactions.findIndex(
    (x: Notification) => x.notificationId === afterId,
  );

  const beforeIndex = orderedNotifiactions.findIndex(
    (x: Notification) => x.notificationId === beforeId,
  );

  const count = orderedNotifiactions.length;
  const parsedLimit = limit ? parseInt(limit, 10) : undefined;
  const { startIndex, endIndex } = findIndices(beforeIndex, afterIndex, parsedLimit, count);
  const notifications: Notification[] = orderedNotifiactions.slice(startIndex, endIndex);

  return {
    notificationCount: count,
    notifications,
  };
}

const findIndices = (
  beforeIndex: number,
  afterIndex: number,
  limit: number | undefined,
  notificationCount: number,
) => {
  let startIndex = 0;
  let endIndex = 0;
  if (beforeIndex > -1 && afterIndex > -1) {
    startIndex = afterIndex + 1;
    endIndex = beforeIndex;
  } else if (beforeIndex > -1 && limit) {
    const index = beforeIndex - limit;
    startIndex = index > 0 ? index : 0;
    endIndex = beforeIndex;
  } else if (beforeIndex > -1) {
    startIndex = 0;
    endIndex = beforeIndex;
  } else if (afterIndex > -1 && limit) {
    startIndex = afterIndex + 1;
    endIndex = afterIndex + 1 + limit;
  } else if (afterIndex > -1) {
    startIndex = afterIndex + 1;
    endIndex = notificationCount - 1;
  } else if (limit) {
    startIndex = 0;
    endIndex = limit;
  } else {
    startIndex = 0;
    endIndex = notificationCount - 1;
  }

  return { startIndex, endIndex };
};

function compareNotifications(a: Notification, b: Notification): number {
  const tsA = new Date(a.originalEvent.createdAt);
  const tsB = new Date(b.originalEvent.createdAt);
  if (tsA < tsB) return 1;
  if (tsA > tsB) return -1;
  return 0;
}

function getNotificationId(event: Event): NotificationId {
  switch (event.dataVersion) {
    case 1: {
      return event.data.notificationId;
    }
  }
  throwUnsupportedEventVersion(event);
  return "exception already thrown, thus this is unreachable code";
}

function handleCreate(event: Event): Notification | undefined {
  if (event.intent !== "notification.create") return undefined;
  switch (event.dataVersion) {
    case 1: {
      return deepcopy(event.data);
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyMarkRead(event: Event, notification: Notification): true | undefined {
  if (event.intent !== "notification.markRead") return;
  switch (event.dataVersion) {
    case 1: {
      notification.isRead = true;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}
