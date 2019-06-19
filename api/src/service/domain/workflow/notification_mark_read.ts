import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Notification from "./notification";
import { sourceNotifications } from "./notification_eventsourcing";
import * as NotificationMarkedRead from "./notification_marked_read";

interface Repository {
  getUserNotificationEvents(userId: UserRecord.Id): Promise<BusinessEvent[]>;
}

export async function markRead(
  ctx: Ctx,
  user: ServiceUser,
  notificationId: Notification.Id,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const notificationEvents = await repository.getUserNotificationEvents(user.id);
  const { notificationsById } = sourceNotifications(ctx, notificationEvents);

  const notification = notificationsById.get(notificationId);
  if (notification === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "notification", notificationId)] };
  }

  if (notification.isRead) {
    // Already read, no need to re-create the event.
    return { newEvents: [], errors: [] };
  }

  // Create the new event:
  const markedRead = NotificationMarkedRead.createEvent(
    ctx.source,
    user.id,
    notificationId,
    notification.recipient,
  );
  // No permission checked since every user should be able
  // to mark their own notifications as read

  // Check that the new event is indeed valid:
  const { errors } = sourceNotifications(ctx, notificationEvents.concat([markedRead]));
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, markedRead, errors)] };
  }

  return { newEvents: [markedRead], errors: [] };
}
