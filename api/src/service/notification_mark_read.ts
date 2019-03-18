import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
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
  const { newEvents, errors } = await Cache.withCache(conn, ctx, cache =>
    NotificationMarkRead.markRead(ctx, user, notificationId, {
      getUserNotificationEvents: async (userId: UserRecord.Id) => {
        return cache.getNotificationEvents(userId);
      },
    }),
  );

  if (errors.length > 0) return Promise.reject(errors);

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
