import strings from "../../localizeStrings";
import { formatString } from "../../helper";

const ACCESSMAP = {
  PROJECT: "project",
  SUBPROJECT: "subproject",
  WORKFLOWITEM: "workflowitem"
};

export function getParentData(notification) {
  const redacted = "Redacted";
  const metadata = notification.metadata;
  let projectDisplayName = "";
  let subprojectDisplayName = "";

  if (metadata !== undefined) {
    if (metadata.project) {
      const {
        displayName: projectName = "",
        hasViewPermissions: hasProjectViewPermissions = false
      } = getDataFromNotification(metadata, ACCESSMAP.PROJECT);
      projectDisplayName = hasProjectViewPermissions ? projectName : redacted;
      if (metadata.subproject) {
        const {
          displayName: subprojectName = "",
          hasViewPermissions: hasSubprojectViewPermissions = false
        } = getDataFromNotification(metadata, ACCESSMAP.SUBPROJECT);
        subprojectDisplayName = hasSubprojectViewPermissions ? subprojectName : redacted;
      }
    }
  }

  return {
    projectDisplayName,
    subprojectDisplayName
  };
}

export const isAllowedToSee = notification => {
  const metadata = notification.metadata;
  if (metadata !== undefined) {
    const { hasViewPermissions = false } = getDataFromNotification(metadata);
    return hasViewPermissions;
  }
  return false;
};

export const intentMapping = notification => {
  const businessEvent = notification.businessEvent;
  if (!businessEvent) {
    // eslint-disable-next-line no-console
    console.warn("Notification has no business event");
    return "";
  }
  const translation = strings.notification[businessEvent.type];

  const notificationMetaData = notification.metadata;
  if (!notificationMetaData) {
    // eslint-disable-next-line no-console
    console.warn("Notification has no metadata");
    return "";
  }

  const { displayName = "", hasViewPermissions = false } = getDataFromNotification(notificationMetaData);

  return hasViewPermissions
    ? formatString(translation, displayName)
    : formatString(translation, "") + " " + strings.notification.no_permissions;
};

const getDataFromNotification = (metadata, type) =>
  type
    ? metadata[type]
    : metadata[ACCESSMAP.WORKFLOWITEM] || metadata[ACCESSMAP.SUBPROJECT] || metadata[ACCESSMAP.PROJECT];

export const parseURI = ({ projectId, subprojectId }) => {
  if (projectId && !subprojectId) {
    return `/projects/${projectId}`;
  } else if (projectId && subprojectId) {
    return `/projects/${projectId}/${subprojectId}`;
  } else {
    throw new Error("not implemented");
  }
};
