import strings from "../../localizeStrings";
import { formatString } from "../../helper";

// get hierarchic deepest displayName
export function getDisplayName(notification) {
  const metadata = notification.metadata;
  if (metadata !== undefined) {
    if (metadata.workflowitem !== undefined && metadata.workflowitem.hasViewPermissions === true) {
      return metadata.workflowitem.displayName;
    }
    if (metadata.subproject !== undefined && metadata.subproject.hasViewPermissions === true) {
      return metadata.subproject.displayName;
    }
    if (metadata.project !== undefined && metadata.project.hasViewPermissions === true) {
      return metadata.project.displayName;
    }
  }
  return "";
}

export const intentMapping = notification => {
  const businessEvent = notification.businessEvent;
  const translation = strings.notification[businessEvent.type];
  const displayName = getDisplayName(notification);
  const text = formatString(translation, displayName);
  return `${text} ${isAllowedToSee(notification) ? "" : strings.notification.no_permissions}`;
};

export const parseURI = ({ projectId, subprojectId }) => {
  if (projectId && !subprojectId) {
    return `/projects/${projectId}`;
  } else if (projectId && subprojectId) {
    return `/projects/${projectId}/${subprojectId}`;
  } else {
    throw new Error("not implemented");
  }
};

export const isAllowedToSee = notification => {
  const metadata = notification.metadata;
  if (metadata !== undefined) {
    if (metadata.workflowitem !== undefined) {
      return metadata.workflowitem.hasViewPermissions;
    }
    if (metadata.subproject !== undefined) {
      return metadata.subproject.hasViewPermissions;
    }
    if (metadata.project !== undefined) {
      return metadata.project.hasViewPermissions;
    }
  }
  return false;
};
