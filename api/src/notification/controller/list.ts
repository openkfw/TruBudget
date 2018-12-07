import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import * as Notification from "../model/Notification";



export const getNotificationList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const limit: string | undefined = req.query.limit;
  const offset: string | undefined = req.query.offset;
  const notificationList = await Notification.get(multichain, req.user, offset, limit);
  const rawNotifications = notificationList.notifications;
  const notificationCount = notificationList.notificationCount;

  const displayNamesById: Map<string, string | undefined> = await Notification.buildDisplayNameMap(
    multichain,
    req.user,
    rawNotifications,
  );

  const notifications: Notification.NotificationDto[] = [];
  for (const rawNotification of rawNotifications) {
    notifications.push({
      notificationId: rawNotification.notificationId,
      resources: rawNotification.resources.map(resourceDescription => ({
        ...resourceDescription,
        displayName: displayNamesById.get(resourceDescription.id),
      })),
      isRead: rawNotification.isRead,
      originalEvent: rawNotification.originalEvent,
    });
  }
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        notifications,
        notificationCount,
      },
    },
  ];
};
