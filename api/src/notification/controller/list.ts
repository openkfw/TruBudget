import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { ResourceType } from "../../lib/resourceTypes";
import { MultichainClient } from "../../multichain";
import { Event } from "../../multichain/event";
import * as Project from "../../project/model/Project";
import * as Subproject from "../../subproject/model/Subproject";
import * as Workflowitem from "../../workflowitem";
import * as Notification from "../model/Notification";
import * as winston from "winston";

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
  const since: string | undefined = req.query.since;

  const rawNotifications = await Notification.get(multichain, req.token, since);

  const notifications: NotificationDto[] = [];
  for (const rawNotification of rawNotifications) {
    notifications.push({
      notificationId: rawNotification.notificationId,
      resources: await augmentResourceList(multichain, req.token, rawNotification),
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
    // Missing view permissions will cause fetching to fail:
    if (project === undefined) return resource;

    return {
      ...resource,
      displayName: project.data.displayName,
    };
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
