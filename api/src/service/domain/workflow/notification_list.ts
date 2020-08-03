import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Notification from "./notification";
import { sourceNotifications } from "./notification_eventsourcing";

interface Repository {
  getUserNotificationEvents(userId: UserRecord.Id): Promise<Result.Type<BusinessEvent[]>>;
}

export async function getUserNotifications(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Result.Type<Notification.Notification[]>> {
  // No permission checked since every user should be able
  // to list their own notifications

  const notificationEventsResult = await repository.getUserNotificationEvents(user.id);
  if (Result.isErr(notificationEventsResult)) {
    return new VError(notificationEventsResult, `fetch notification events failed`);
  }
  const { notificationsById } = sourceNotifications(ctx, notificationEventsResult);

  const userNotifications = [...notificationsById.values()].filter((x) => x.recipient === user.id);
  return userNotifications;
}
