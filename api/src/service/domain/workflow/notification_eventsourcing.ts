import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as UserRecord from "../organization/user_record";

import * as Notification from "./notification";
import * as NotificationCreated from "./notification_created";
import * as NotificationMarkedRead from "./notification_marked_read";
import { NotificationTraceEvent } from "./notification_trace_event";

type NotificationsById = Map<Notification.Id, Notification.Notification>;

export function sourceNotifications(
  ctx: Ctx,
  events: BusinessEvent[],
): { notificationsById: NotificationsById; errors: EventSourcingError[] } {
  const notificationsById = new Map<UserRecord.Id, Notification.Notification>();
  const errors: EventSourcingError[] = [];

  for (const event of events) {
    apply(ctx, notificationsById, event, errors);
  }

  return { notificationsById, errors };
}

function apply(
  ctx: Ctx,
  notificationsById: NotificationsById,
  event: BusinessEvent,
  errors: EventSourcingError[],
): void {
  if (event.type === "notification_created") {
    handleCreate(ctx, notificationsById, event, errors);
  } else if (event.type === "notification_marked_read") {
    applyRead(ctx, notificationsById, event, errors);
  }
}

function handleCreate(
  ctx: Ctx,
  notificationsById: NotificationsById,
  notificationCreated: NotificationCreated.Event,
  errors: EventSourcingError[],
): void {
  logger.trace({ event: notificationCreated }, "Applying notification_created event");

  let notification = notificationsById.get(notificationCreated.notificationId);
  if (notification !== undefined) {
    errors.push(
      new EventSourcingError(
        { ctx, event: notificationCreated, target: notification },
        "notification already exists",
      ),
    );
    return;
  }

  const traceEvent: NotificationTraceEvent = {
    entityId: notificationCreated.notificationId,
    entityType: "notification",
    businessEvent: notificationCreated.businessEvent,
  };
  notification = {
    id: notificationCreated.notificationId,
    createdAt: notificationCreated.time,
    recipient: notificationCreated.recipient,
    isRead: false,
    businessEvent: notificationCreated.businessEvent,
    projectId: notificationCreated.projectId,
    subprojectId: notificationCreated.subprojectId,
    workflowitemId: notificationCreated.workflowitemId,
    log: [traceEvent],
  };

  const result = Notification.validate(notification);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: notificationCreated }, result));
    return;
  }

  notificationsById.set(notification.id, notification);
}

function applyRead(
  ctx: Ctx,
  notificationsById: NotificationsById,
  notificationRead: NotificationMarkedRead.Event,
  errors: EventSourcingError[],
): void {
  logger.trace({ event: notificationRead }, "Applying notification_mark_read event");
  const notification = deepcopy(notificationsById.get(notificationRead.notificationId));
  if (notification === undefined) {
    errors.push(new EventSourcingError({ ctx, event: notificationRead }, "notification not found"));
    return;
  }

  notification.isRead = true;

  const result = Notification.validate(notification);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: notificationRead }, result));
    return;
  }

  notificationsById.set(notificationRead.notificationId, notification);
}
