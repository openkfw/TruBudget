import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../service/Client.h";
import * as Notification from "../model/Notification";

export const getNewestNotifications = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const beforeId: string | undefined = req.query.beforeId;
  const notificationList = await Notification.get(multichain, req.user);
  const rawNotifications = notificationList.notifications;

  let index = 0;

  // If the beforeId is 0 it means that there are no messages yet in the user's inbox
  // This case needs special handling for the fly-in notifications
  if (beforeId === "0") {
    index = rawNotifications.length;
  } else {
    index = rawNotifications.findIndex(notification => notification.notificationId === beforeId);
  }

  const notifications: Notification.NotificationDto[] = [];
  if (index > 0) {
    const relevantNotfications = rawNotifications.slice(0, index);
    const displayNamesById: Map<
      string,
      string | undefined
    > = await Notification.buildDisplayNameMap(multichain, req.user, relevantNotfications);
    for (const notification of relevantNotfications) {
      notifications.push({
        notificationId: notification.notificationId,
        resources: notification.resources.map(resourceDescription => ({
          ...resourceDescription,
          displayName: displayNamesById.get(resourceDescription.id),
        })),
        isRead: notification.isRead,
        originalEvent: notification.originalEvent,
      });
    }
  }

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        notifications,
      },
    },
  ];
};
