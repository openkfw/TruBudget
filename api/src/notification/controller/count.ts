import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain/Client.h";
import * as Notification from "../model/Notification";

export const getNotificationCounts = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const rawNotifications = await Notification.get(multichain, req.user);
  const unreadNotificationCount = rawNotifications.unreadNotificationCount;
  const notificationCount = rawNotifications.notificationCount;

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        unreadNotificationCount,
        notificationCount
      },
    },
  ];
};
