import { v4 as uuid } from "uuid";
import Intent from "../authz/intents";
import { UserId } from "../authz/types";
import { ResourceType } from "../lib/resourceTypes";
import { MultichainClient } from "../multichain";
import { Event } from "../multichain/event";
import * as Notification from "./model/Notification";

export const createNotification = async (
  multichain: MultichainClient,
  resources: Notification.NotificationResourceDescription[],
  createdBy: UserId,
  createdFor: UserId,
  originalEvent: Event,
): Promise<void> => {
  const notificationId: string = uuid();

  const intent: Intent = "notification.create";
  const creationTimestamp = new Date();
  const dataVersion = 1;
  const data: Notification.EventData = {
    notificationId,
    resources,
    isRead: false,
    originalEvent,
  };
  const event = { intent, createdBy, creationTimestamp, dataVersion, data };

  return Notification.publish(multichain, createdFor, event);
};
