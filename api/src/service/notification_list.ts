import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserRecord from "./domain/organization/user_record";
import * as Notification from "./domain/workflow/notification";
import * as NotificationList from "./domain/workflow/notification_list";

export async function getNotificationsForUser(
  conn: ConnToken,
  ctx: Ctx,
  user: ServiceUser,
): Promise<Notification.Notification[]> {
  const userNotifications = await Cache.withCache(conn, ctx, cache =>
    NotificationList.getUserNotifications(ctx, user, {
      getUserNotificationEvents: async (userId: UserRecord.Id) => {
        return cache.getNotificationEvents(userId);
      },
    }),
  );
  return userNotifications;
}
