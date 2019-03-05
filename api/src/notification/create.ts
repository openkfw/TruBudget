import { v4 as uuid } from "uuid";

import Intent from "../authz/intents";
import { UserId } from "../authz/types";
import { getUsersForGroup, groupExists } from "../group";
import logger from "../lib/logger";
import * as Project from "../project/model/Project";
import { MultichainClient } from "../service/Client.h";
import { Event } from "../service/event";
import * as Subproject from "../subproject/model/Subproject";
import * as Workflowitem from "../workflowitem/model/Workflowitem";
import * as Notification from "./model/Notification";

export async function createNotification(
  multichain: MultichainClient,
  resources: Notification.NotificationResourceDescription[],
  createdBy: UserId,
  createdFor: UserId,
  originalEvent: Event,
): Promise<void> {
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
}

/**
 * Notify the assignee of the resource identified by the given IDs.
 *
 * @param publishedEvent The original event the notification should relate to.
 * @param skipNotificationsFor A list of users that should _not_ be notified.
 */
export async function notifyAssignee(
  multichain: MultichainClient,
  resourceDescriptions: Notification.NotificationResourceDescription[],
  createdBy: UserId,
  resourceOrResourceList:
    | Project.ProjectResource
    | Project.ProjectResource[]
    | Subproject.SubprojectResource
    | Subproject.SubprojectResource[]
    | Workflowitem.WorkflowitemResource
    | Workflowitem.WorkflowitemResource[]
    | undefined,
  publishedEvent: Event,
  skipNotificationsFor: UserId[],
): Promise<string | undefined> {
  const resource = getResource(resourceOrResourceList);
  if (resource === undefined) return;

  const assignee = resource.data.assignee;
  if (assignee === undefined) return;
  const isAssigneeGroup = await groupExists(multichain, assignee);

  /**
   * When assignee is a group we need to fetch all users other we will just use the user that was assigned
   */
  const assignees = isAssigneeGroup ? await getUsersForGroup(multichain, assignee) : [assignee];
  logger.debug({ groupid: assignee, users: assignees }, "Resource was assigned to group");
  await Promise.all(
    assignees.map(async groupMember => {
      if (!skipNotificationsFor.includes(groupMember)) {
        await createNotification(
          multichain,
          resourceDescriptions,
          createdBy,
          groupMember,
          publishedEvent,
        );
      }
    }),
  );
  return assignee;
}

function getResource(
  resourceOrResourceList:
    | Project.ProjectResource
    | Project.ProjectResource[]
    | Subproject.SubprojectResource
    | Subproject.SubprojectResource[]
    | Workflowitem.WorkflowitemResource
    | Workflowitem.WorkflowitemResource[]
    | undefined,
):
  | Project.ProjectResource
  | Subproject.SubprojectResource
  | Workflowitem.WorkflowitemResource
  | undefined {
  if (Array.isArray(resourceOrResourceList)) {
    const resourceList = resourceOrResourceList;
    if (resourceList.length > 0) {
      return resourceList[0];
    } else {
      return undefined;
    }
  } else {
    const resource = resourceOrResourceList;
    return resource;
  }
}
