import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { MultichainClient } from "../../multichain";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";

const streamName = "notifications";

type NotificationId = string;

export interface EventData {
  notificationId: NotificationId;
  resourceId: string;
  resourceType: string;
  isRead: boolean;
}

export interface NotificationDto {
  notificationId: NotificationId;
  resourceId: string;
  resourceType: string;
  createdBy: string;
  createdAt: string;
  isRead: boolean;
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
    console.log(`Publishing ${intent} to ${streamName}/${userId}`);
    return multichain.getRpcClient().invoke("publish", streamName, userId, {
      json: event,
    });
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "notifications", name: streamName })
        .then(() => publishEvent());
    } else {
      throw err;
    }
  });
}

export async function get(
  multichain: MultichainClient,
  token: AuthToken,
  since?: string,
): Promise<NotificationDto[]> {
  const streamItems = await multichain.v2_readStreamItems(streamName, token.userId).catch(err => {
    if (err.kind === "NotFound" && err.what === "stream notifications") {
      // The stream does not exist yet, which happens on (freshly installed) systems that
      // have not seen any notifications yet.
      return [];
    } else {
      throw err;
    }
  });
  const notificationsById = new Map<NotificationId, NotificationDto>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    const notificationId = getNotificationId(event);
    let notification = notificationsById.get(notificationId);
    if (notification === undefined) {
      notification = handleCreate(event);
      if (notification === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
    } else {
      // We've already encountered this notification, so we can apply operations on it.
      const hasProcessedEvent = applyMarkRead(event, notification);
      if (!hasProcessedEvent) {
        throw Error(`I don't know how to handle this event: ${JSON.stringify(event)}.`);
      }
    }

    if (notification !== undefined) {
      notificationsById.set(notificationId, notification);
    }
  }

  const unorderedNotifications = [...notificationsById.values()];

  return unorderedNotifications.sort(compareNotifications);
}

function compareNotifications(a: NotificationDto, b: NotificationDto): number {
  const tsA = new Date(a.createdAt);
  const tsB = new Date(b.createdAt);
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

function handleCreate(event: Event): NotificationDto | undefined {
  if (event.intent !== "notification.create") return undefined;
  switch (event.dataVersion) {
    case 1: {
      return {
        ...event.data,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
      };
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyMarkRead(event: Event, notification: NotificationDto): true | undefined {
  if (event.intent !== "notification.markRead") return;
  switch (event.dataVersion) {
    case 1: {
      notification.isRead = true;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}
