import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import deepcopy from "../../lib/deepcopy";
import { isEmpty } from "../../lib/emptyChecks";
import logger from "../../lib/logger";
import { ResourceType } from "../../lib/resourceTypes";
import { MultichainClient } from "../../multichain/Client.h";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";
import * as Liststreamkeyitems from "../../multichain/liststreamkeyitems";
import * as Project from "../../project/model/Project";
import * as Subproject from "../../subproject/model/Subproject";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";

const streamName = "notifications";
export type NotificationId = string;

interface ExtendedNotificationResourceDescription {
  id: string;
  type: ResourceType;
  displayName?: string;
}

export interface NotificationDto {
  notificationId: NotificationId;
  resources: ExtendedNotificationResourceDescription[];
  isRead: boolean;
  originalEvent: Event;
}

export interface NotificationResourceDescription {
  id: string;
  type: ResourceType;
}

export interface EventData {
  notificationId: NotificationId;
  resources: NotificationResourceDescription[];
  isRead: boolean;
  originalEvent: Event;
}

export interface Notification {
  notificationId: NotificationId;
  resources: NotificationResourceDescription[];
  isRead: boolean;
  originalEvent: Event;
}

export interface NotificationList {
  unreadNotificationCount: number;
  notificationCount: number;
  notifications: Notification[];
}

export async function publish(
  multichain: MultichainClient,
  userId: string,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    dataVersion: number; // integer
    data: object;
  },
): Promise<void> {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: userId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${userId}`);
    return multichain.getRpcClient().invoke("publish", streamName, userId, {
      json: event,
    });
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "notifications", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

export async function get(
  multichain: MultichainClient,
  token: AuthToken,
  offset?: string,
  limit?: string,
): Promise<NotificationList> {
  const streamItems: Liststreamkeyitems.Item[] = await multichain
    .v2_readStreamItems(streamName, token.userId)
    .catch(err => {
      if (err.kind === "NotFound" && err.what === "stream notifications") {
        logger.warn(`The stream ${streamName} does not exist yet.`);
        // The stream does not exist yet, which happens on (freshly installed) systems that
        // have not seen any notifications yet.
        return [];
      } else {
        logger.error({ error: err }, `Getting stream ${streamName} failed.`);
        throw err;
      }
    });
  const notificationsById = new Map<NotificationId, Notification>();
  for (const streamItem of streamItems) {
    const event = streamItem.data.json as Event;
    const notificationId = getNotificationId(event);

    let notification = notificationsById.get(notificationId);
    if (notification === undefined) {
      notification = handleCreate(event);
      // We ignore that this might fail, because the event could relate to a notification
      // that has already been skipped.
    } else {
      // We've already encountered this notification, so we can apply operations on it.
      const hasProcessedEvent = applyMarkRead(event, notification);
      if (!hasProcessedEvent) {
        const message = "Unexpected event occured";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }

    if (notification !== undefined) {
      notificationsById.set(notificationId, notification);
    }
  }

  const unorderedNotifications = [...notificationsById.values()];

  const orderedNotifiactions = unorderedNotifications.sort(compareNotifications);

  const notificationCount = orderedNotifiactions.length;
  const unreadNotificationCount = orderedNotifiactions.filter(x => !x.isRead).length;

  const parsedLimit = limit ? parseInt(limit, 10) : undefined;
  const parsedOffset = offset ? parseInt(offset, 10) : undefined;
  const { startIndex, endIndex } = findIndices(parsedOffset, parsedLimit, notificationCount);

  const notifications: Notification[] = orderedNotifiactions.slice(startIndex, endIndex);

  return {
    unreadNotificationCount,
    notificationCount,
    notifications,
  };
}

const findIndices = (
  offset: number | undefined,
  limit: number | undefined,
  notificationCount: number,
) => {
  let startIndex = 0;
  let endIndex = 0;
  if (!isEmpty(offset) && !isEmpty(limit)) {
    (startIndex = offset), (endIndex = offset + limit);
  } else if (!isEmpty(offset)) {
    startIndex = offset;
    endIndex = notificationCount;
  } else if (!isEmpty(limit)) {
    startIndex = 0;
    endIndex = limit;
  } else {
    startIndex = 0;
    endIndex = notificationCount;
  }
  return { startIndex, endIndex };
};

function compareNotifications(a: Notification, b: Notification): number {
  const tsA = new Date(a.originalEvent.createdAt);
  const tsB = new Date(b.originalEvent.createdAt);
  if (tsA < tsB) return 1;
  if (tsA > tsB) return -1;
  return 0;
}

function getNotificationId(event: Event): NotificationId {
  switch (event.dataVersion) {
    case 1: {
      return event.data.notificationId;
    }
  }
  throwUnsupportedEventVersion(event);
  return "exception already thrown, thus this is unreachable code";
}

function handleCreate(event: Event): Notification | undefined {
  if (event.intent !== "notification.create") return undefined;
  switch (event.dataVersion) {
    case 1: {
      return deepcopy(event.data);
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyMarkRead(event: Event, notification: Notification): true | undefined {
  if (event.intent !== "notification.markRead") return;
  switch (event.dataVersion) {
    case 1: {
      notification.isRead = true;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export async function buildDisplayNameMap(
  multichain: MultichainClient,
  token: AuthToken,
  rawNotifications: Notification[],
): Promise<Map<string, string | undefined>> {
  // The displayNames for all IDs found in the resource descriptions:
  const displayNamesById: Map<string, string | undefined> = new Map();

  // The set of related projects:
  const projectSet: Set<string> = new Set();
  // Lookup table telling us to which project a subproject belongs to:
  type ProjectId = string;
  type SubprojectId = string;
  const subprojectParentLookup: Map<SubprojectId, ProjectId> = new Map();
  // Lookup table telling us to which subproject a workflowitem belongs to:
  type WorkflowitemId = string;
  const workflowitemParentLookup: Map<WorkflowitemId, SubprojectId> = new Map();

  for (const notification of rawNotifications) {
    const projectId = getResourceId(notification.resources, "project");
    const subprojectId = getResourceId(notification.resources, "subproject");
    const workflowitemId = getResourceId(notification.resources, "workflowitem");

    if (projectId === undefined) {
      const message = "Missing projectId";
      throw Error(`${message}: ${JSON.stringify(notification.resources)}`);
    }

    projectSet.add(projectId);
    if (subprojectId) {
      subprojectParentLookup.set(subprojectId, projectId);
      if (workflowitemId) {
        workflowitemParentLookup.set(workflowitemId, subprojectId);
      }
    }
  }

  for (const [projectId, _] of projectSet.entries()) {
    displayNamesById.set(projectId, await getProjectDisplayName(multichain, token, projectId));
  }

  for (const [subprojectId, projectId] of subprojectParentLookup.entries()) {
    displayNamesById.set(
      subprojectId,
      await getSubprojectDisplayName(multichain, token, projectId, subprojectId),
    );
  }

  for (const [workflowitemId, subprojectId] of workflowitemParentLookup.entries()) {
    const projectId: string = subprojectParentLookup.get(subprojectId)!;
    displayNamesById.set(
      workflowitemId,
      await getWorkflowitemDisplayName(multichain, token, projectId, subprojectId, workflowitemId),
    );
  }

  return displayNamesById;
}

function getResourceId(
  resources: NotificationResourceDescription[],
  resourceType: ResourceType,
): string | undefined {
  return resources
    .filter(x => x.type === resourceType)
    .map(x => x.id)
    .find(_ => true);
}

function getProjectDisplayName(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
): Promise<string | undefined> {
  return Project.get(multichain, token, projectId).then(items =>
    items.map(x => x.data.displayName).find(_ => true),
  );
}

function getSubprojectDisplayName(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
): Promise<string | undefined> {
  return Subproject.get(multichain, token, projectId, subprojectId).then(items =>
    items.map(x => x.data.displayName).find(_ => true),
  );
}

function getWorkflowitemDisplayName(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<string | undefined> {
  return Workflowitem.get(multichain, token, projectId, subprojectId, workflowitemId).then(items =>
    items.map(x => x.data.displayName).find(_ => true),
  );
}
