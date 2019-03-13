import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserRecord from "./domain/organization/user_record";
import * as Notification from "./domain/workflow/notification";
import * as NotificationMarkRead from "./domain/workflow/notification_mark_read";
import { store } from "./store";

export async function markRead(
  conn: ConnToken,
  ctx: Ctx,
  user: ServiceUser,
  notificationId: Notification.Id,
): Promise<void> {
  const { newEvents, errors } = await NotificationMarkRead.markRead(ctx, user, notificationId, {
    getUserNotificationEvents: async (userId: UserRecord.Id) => {
      await Cache2.refresh(conn);
      return (conn.cache2.eventsByStream.get("notifications") || []).filter(byUser(userId));
    },
  });

  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}

function byUser(userId: UserRecord.Id): (event: BusinessEvent) => boolean {
  return event => {
    if (!event.type.startsWith("notification_")) {
      logger.debug(`Unexpected event type in "notifications" stream: ${event.type}`);
      return false;
    }

    switch (event.type) {
      case "notification_created":
        return event.recipient === userId;
      case "notification_marked_read":
        return event.recipient === userId;
      default:
        throw Error(`not implemented: notification event of type ${event.type}`);
    }
  };
}
