import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { ResourceType } from "../../lib/resourceTypes";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Project from "../../project/model/Project";
import * as Subproject from "../../subproject/model/Subproject";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import * as Notification from "../model/Notification";
import logger from "../../lib/logger";
import { isEmpty } from "../../lib/emptyChecks";

type ResourceMetadataMap = object;

interface ExtendedNotificationResourceDescription {
  id: string;
  type: ResourceType;
  displayName?: string;
}

interface NotificationDto {
  notificationId: Notification.NotificationId;
  resources: ExtendedNotificationResourceDescription[];
  isRead: boolean;
  originalEvent: Event;
}

export const getNewestNotifications = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const beforeId: string | undefined = req.query.beforeId;
  const notificationList = await Notification.get(multichain, req.user);
  const rawNotifications = notificationList.notifications;

  const index = rawNotifications.findIndex(
    notification => notification.notificationId === beforeId,
  );




  const notifications: NotificationDto[] = [];
  if (!beforeId) {
    const notification = rawNotifications[0];
    const displayNamesById: Map<
      string,
      string | undefined
    > = await Notification.buildDisplayNameMap(multichain, req.user, [notification]);

    notifications.push({
      notificationId: notification.notificationId,
      resources: notification.resources.map(resourceDescription => ({
        ...resourceDescription,
        displayName: displayNamesById.get(resourceDescription.id),
      })),
      isRead: notification.isRead,
      originalEvent: notification.originalEvent,
    });
  } else if (index > 0) {
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
