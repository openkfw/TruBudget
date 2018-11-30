import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Notification from "../model/Notification";

export const markNotificationAllRead = async (
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);
  const notificationIds = value("notificationIds", input.notificationIds, ids => ids.length > 0);
  value("notificationIds", notificationIds, x => x.every(id => isNonemptyString(id)));

  const userIntent: Intent = "notification.markRead";

  await Promise.all(
    notificationIds.map(async notificationId => {
      const event = {
        intent: userIntent,
        createdBy: req.user.userId,
        creationTimestamp: new Date(),
        dataVersion: 1,
        data: { notificationId },
      };
      await Notification.publish(multichain, req.user.userId, event);
    }),
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
