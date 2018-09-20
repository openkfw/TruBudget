import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Notification from "../model/Notification";

export const markNotificationRead = async (
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> => {
  const input = value("data", req.body.data, x => x !== undefined);

  const notificationId: string = value("notificationId", input.notificationId, isNonemptyString);

  const userIntent: Intent = "notification.markRead";

  const event = {
    intent: userIntent,
    createdBy: req.user.userId,
    creationTimestamp: new Date(),
    dataVersion: 1,
    data: { notificationId },
  };

  await Notification.publish(multichain, req.user.userId, event);

  return [
    200,
    {
      apiVersion: "1.0",
      data: "OK",
    },
  ];
};
