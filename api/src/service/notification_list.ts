import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserRecord from "./domain/organization/user_record";
import * as Notification from "./domain/workflow/notification";
import * as NotificationList from "./domain/workflow/notification_list";
import { loadNotificationEvents } from "./load";

export async function getNotificationsForUser(
  conn: ConnToken,
  ctx: Ctx,
  user: ServiceUser,
): Promise<Notification.Notification[]> {
  const userNotifications = await NotificationList.getUserNotifications(ctx, user, {
    getUserNotificationEvents: async (userId: UserRecord.Id) =>
      loadNotificationEvents(conn, userId),
  });
  return userNotifications;
}
