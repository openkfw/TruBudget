import strings from "../../localizeStrings";
import { formatString } from "../../helper";

export function getResourceName(projectId, subprojectId, workflowitemId) {
  let resourceName = "";
  if (projectId !== undefined) {
    resourceName = strings.common.project;
  }
  if (subprojectId !== undefined) {
    resourceName = strings.common.subproject;
  }
  if (workflowitemId !== undefined) {
    resourceName = strings.common.workflowItem;
  }
  return resourceName;
}

export const intentMapping = ({ businessEvent, projectId, subprojectId, workflowitemId }) => {
  const translation = strings.notification[businessEvent.type];
  // displayname is not displayed in notification because businessEvent does not return a displayname
  const displayName = "";
  const text = formatString(translation, displayName);
  return `${text} ${hasAccess(projectId, subprojectId, workflowitemId) ? "" : strings.notification.no_permissions}`;
};

export const parseURI = ({ projectId, subprojectId }) => {
  if (projectId && !subprojectId) {
    return `/projects/${projectId}`;
  } else if (projectId && subprojectId) {
    return `/projects/${projectId}/${subprojectId}`;
  } else {
    //ERROR?
  }
};

export const hasAccess = (projectId, subprojectId, workflowitemId) => {
  const resourceId = workflowitemId || subprojectId || projectId;
  if (resourceId === undefined) {
    return undefined;
  }

  return false;
};
