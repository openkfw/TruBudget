import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Notification from "./notification";
import { sourceNotifications } from "./notification_eventsourcing";

interface Repository {
  getUserNotificationEvents(userId: UserRecord.Id): Promise<BusinessEvent[]>;
}

export async function getUserNotifications(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Notification.Notification[]> {
  // notification.list is in the global permissions, but currently there's no reason to
  // check this (might change in the future)

  const notificationEvents = await repository.getUserNotificationEvents(user.id);
  const { notificationsById } = sourceNotifications(ctx, notificationEvents);

  const userNotifications = [...notificationsById.values()].filter(x => x.recipient === user.id);
  return userNotifications;
}
