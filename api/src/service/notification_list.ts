import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserRecord from "./domain/organization/user_record";
import * as Notification from "./domain/workflow/notification";
import * as NotificationList from "./domain/workflow/notification_list";

export async function getNotificationsForUser(
  conn: ConnToken,
  ctx: Ctx,
  user: ServiceUser,
): Promise<Notification.Notification[]> {
  const userNotifications = await NotificationList.getUserNotifications(ctx, user, {
    getUserNotificationEvents: async (userId: UserRecord.Id) => {
      await Cache2.refresh(conn);
      return (conn.cache2.eventsByStream.get("notifications") || []).filter(byUser(userId));
    },
  });
  return userNotifications;
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
      case "notification_read":
        return event.recipient === userId;
      default:
        throw Error(`not implemented: notification event of type ${event.type}`);
    }
  };
}
