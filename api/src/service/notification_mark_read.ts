import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
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
  notificationIds: Notification.Id[],
): Promise<Result.Type<void>> {
  try {
    let newEvents: BusinessEvent[] = [];
    for (const id of notificationIds) {
      const newEventResult = await Cache.withCache(conn, ctx, (cache) =>
        NotificationMarkRead.markRead(ctx, user, id, {
          getUserNotificationEvents: async (userId: UserRecord.Id) => {
            return cache.getNotificationEvents(userId);
          },
        }),
      );
      if (Result.isErr(newEventResult)) {
        return new VError(newEventResult, `failed to mark notification ${id} as read`);
      }
      newEvents = newEvents.concat(newEventResult);
    }

    for (const newEvent of newEvents) {
      await store(conn, ctx, newEvent);
    }
  } catch (error) {
    return error;
  }
}
