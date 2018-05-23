import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import * as Notification from "../model/Notification";

export const getNotificationList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const since: string | undefined = req.query.since;

  const notifications = await Notification.get(multichain, req.token, since);

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
