import { AuthToken } from "../../authz/token";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { ResourceType } from "../../lib/resourceTypes";
import { MultichainClient } from "../../multichain";
import * as Project from "../../project/model/Project";
import * as Subproject from "../../subproject/model/Subproject";
import * as Workflowitem from "../../workflowitem";
import * as Notification from "../model/Notification";

type ResourceMetadataMap = object;

interface NotificationDto extends Notification.Notification {
  resourceMetadata: ResourceMetadataMap;
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
      ...rawNotification,
      resourceMetadata: await getMetadata(multichain, req.token, rawNotification),
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

async function getMetadata(
  multichain: MultichainClient,
  token: AuthToken,
  notification: Notification.Notification,
): Promise<ResourceMetadataMap> {
  const metadataMap = {};
  for (const resource of notification.resources) {
    if (resource.type === "project") {
      const project = await Project.get(multichain, token, resource.id).then(
        x => (x.length ? x[0] : undefined),
      );
      if (project === undefined) continue;
      const { displayName } = project.data;
      metadataMap[resource.id] = {
        type: resource.type,
        displayName,
      };
    } else if (resource.type === "subproject") {
      // The project should be given in resources as well:
      const projectResource = notification.resources.find(r => r.type === "project");
      if (projectResource === undefined) continue;
      const subproject = await Subproject.get(
        multichain,
        token,
        projectResource.id,
        resource.id,
      ).then(x => (x.length ? x[0] : undefined));
      if (subproject === undefined) continue;
      const { displayName } = subproject.data;
      metadataMap[resource.id] = {
        type: resource.type,
        displayName,
      };
    } else if (resource.type === "workflowitem") {
      // Project and subproject should be given in resources as well:
      const projectResource = notification.resources.find(r => r.type === "project");
      if (projectResource === undefined) continue;
      const subprojectResource = notification.resources.find(r => r.type === "subproject");
      if (subprojectResource === undefined) continue;
      const workflowitem = await Workflowitem.get(
        multichain,
        token,
        projectResource.id,
        subprojectResource.id,
        resource.id,
      ).then(x => (x.length ? x[0] : undefined));
      if (workflowitem === undefined) continue;
      const { displayName } = workflowitem.data;
      metadataMap[resource.id] = {
        type: resource.type,
        displayName,
      };
    } else {
      console.log(
        `Unknown resource type "${resource.type}" in notification: ${JSON.stringify(notification)}`,
      );
    }
  }
  return metadataMap;
}
