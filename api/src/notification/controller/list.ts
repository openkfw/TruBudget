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

export const getNotificationList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const sinceId: string | undefined = req.query.sinceId;

  const rawNotifications = await Notification.get(multichain, req.user, sinceId);

  const displayNamesById: Map<string, string | undefined> = await buildDisplayNameMap(
    multichain,
    req.user,
    rawNotifications,
  );

  const notifications: NotificationDto[] = [];
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
      },
    },
  ];
};

async function buildDisplayNameMap(
  multichain: MultichainClient,
  token: AuthToken,
  rawNotifications: Notification.Notification[],
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
      const message= "Missing projectId";
      logger.error({error: notification.resources}, message );
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
  resources: Notification.NotificationResourceDescription[],
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
