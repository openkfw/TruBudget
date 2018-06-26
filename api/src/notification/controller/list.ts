import * as winston from "winston";
import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { ResourceType } from "../../lib/resourceTypes";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Project from "../../project/model/Project";
import * as Subproject from "../../subproject/model/Subproject";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import * as Notification from "../model/Notification";

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

  console.time("getAll");
  const rawNotifications = await Notification.get(multichain, req.token, sinceId);
  console.timeEnd("getAll");

  console.time("buildDisplayNameMap");
  const displayNamesById: Map<string, string | undefined> = await buildDisplayNameMap(
    multichain,
    req.token,
    rawNotifications,
  );
  console.timeEnd("buildDisplayNameMap");

  console.time("augment resource list - new version");
  const newNotifications: NotificationDto[] = [];
  for (const rawNotification of rawNotifications) {
    newNotifications.push({
      notificationId: rawNotification.notificationId,
      resources: rawNotification.resources.map(resourceDescription => ({
        ...resourceDescription,
        displayName: displayNamesById.get(resourceDescription.id),
      })),
      isRead: rawNotification.isRead,
      originalEvent: rawNotification.originalEvent,
    });
  }
  console.timeEnd("augment resource list - new version");

  console.time("augment resource list - old version");
  const notifications: NotificationDto[] = [];
  for (const rawNotification of rawNotifications) {
    notifications.push({
      notificationId: rawNotification.notificationId,
      resources: await augmentResourceList(multichain, req.token, rawNotification),
      isRead: rawNotification.isRead,
      originalEvent: rawNotification.originalEvent,
    });
  }
  console.timeEnd("augment resource list - old version");

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
      throw Error(`unexpected resource description: ${JSON.stringify(notification.resources)}`);
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

async function getProjectDisplayName(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
): Promise<string | undefined> {
  return Project.get(multichain, token, projectId).then(items =>
    items.map(x => x.data.displayName).find(_ => true),
  );
}

async function getSubprojectDisplayName(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
): Promise<string | undefined> {
  return Subproject.get(multichain, token, projectId, subprojectId).then(items =>
    items.map(x => x.data.displayName).find(_ => true),
  );
}

async function getWorkflowitemDisplayName(
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

// --

async function augmentResourceList(
  multichain: MultichainClient,
  token: AuthToken,
  notification: Notification.Notification,
): Promise<ExtendedNotificationResourceDescription[]> {
  const augmentedResourceDescriptions: ExtendedNotificationResourceDescription[] = [];
  for (const resource of notification.resources) {
    const augmentedResource = await augmentResource(multichain, token, notification, resource);
    augmentedResourceDescriptions.push(augmentedResource);
  }
  return augmentedResourceDescriptions;
}

async function augmentResource(
  multichain: MultichainClient,
  token: AuthToken,
  notification: Notification.Notification,
  resource: Notification.NotificationResourceDescription,
): Promise<ExtendedNotificationResourceDescription> {
  if (resource.type === "project") {
    const project = await Project.get(multichain, token, resource.id).then(
      x => (x.length ? x[0] : undefined),
    );
    if (project === undefined) {
      // most likely missing view permissions
      return resource;
    } else {
      return { ...resource, displayName: project.data.displayName };
    }
  } else if (resource.type === "subproject") {
    // The project should be given in resources as well:
    const projectResource = notification.resources.find(r => r.type === "project");
    if (projectResource === undefined) {
      winston.error(
        `Expected subproject-specific notifcation to include a project resource description!`,
        notification,
      );
      return resource;
    }

    const subproject = await Subproject.get(
      multichain,
      token,
      projectResource.id,
      resource.id,
    ).then(x => (x.length ? x[0] : undefined));
    // Missing view permissions will cause fetching to fail:
    if (subproject === undefined) return resource;

    return {
      ...resource,
      displayName: subproject.data.displayName,
    };
  } else if (resource.type === "workflowitem") {
    // Project and subproject should be given in resources as well:
    const projectResource = notification.resources.find(r => r.type === "project");
    if (projectResource === undefined) {
      winston.error(
        `Expected workflowitem-specific notifcation to include a project resource description!`,
        notification,
      );
      return resource;
    }

    const subprojectResource = notification.resources.find(r => r.type === "subproject");
    if (subprojectResource === undefined) {
      winston.error(
        `Expected workflowitem-specific notifcation to include a subproject resource description!`,
        notification,
      );
      return resource;
    }

    const workflowitem = await Workflowitem.get(
      multichain,
      token,
      projectResource.id,
      subprojectResource.id,
      resource.id,
    ).then(x => (x.length ? x[0] : undefined));
    if (!workflowitem || !workflowitem.data.displayName) {
      // workflowitem not found or redacted due to missing view permissions
      return resource;
    }

    return {
      ...resource,
      displayName: workflowitem.data.displayName,
    };
  } else {
    winston.error(`Unknown resource type "${resource.type}" in notification`, notification);
    return resource;
  }
}
