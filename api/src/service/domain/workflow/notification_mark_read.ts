import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as Notification from "./notification";
import { sourceNotifications } from "./notification_eventsourcing";
import * as NotificationMarkedRead from "./notification_marked_read";

interface Repository {
  getUserNotificationEvents(userId: UserRecord.Id): Promise<Result.Type<BusinessEvent[]>>;
}

export async function markRead(
  ctx: Ctx,
  user: ServiceUser,
  notificationId: Notification.Id,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const notificationEventsResult = await repository.getUserNotificationEvents(user.id);

  if (Result.isErr(notificationEventsResult))
    return new VError(notificationEventsResult, "could not get notification events");

  const notificationEvents = notificationEventsResult;
  const { notificationsById } = sourceNotifications(ctx, notificationEventsResult);

  const notification = notificationsById.get(notificationId);
  if (notification === undefined) {
    return new NotFound(ctx, "notification", notificationId);
  }

  logger.trace({ user, notificationId }, "Creating notification_mark_read event");
  const markedRead = NotificationMarkedRead.createEvent(
    ctx.source,
    user.id,
    notificationId,
    notification.recipient,
    new Date().toISOString(),
    user.metadata,
  );
  if (Result.isErr(markedRead)) {
    return new VError(markedRead, "failed to create notification marked read event");
  }

  // Already read
  if (notification.isRead) {
    return [];
  }
  // No permission checked since every user should be able
  // to mark their own notifications as read

  logger.trace({ markedRead }, "Checking if markedRead event is valid");
  const { errors } = sourceNotifications(ctx, notificationEvents.concat([markedRead]));
  if (errors.length > 0) {
    return new InvalidCommand(ctx, markedRead, errors);
  }

  return [markedRead];
}
