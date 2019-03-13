import strings from "../../localizeStrings";
import { formatString } from "../../helper";

function findDisplayName(intent, resources) {
  const resourceType = intent.substring(0, intent.indexOf("."));
  if (!resourceType) throw Error(`Unknown resource type for intent ${intent}`);
  const resource = resources.find(x => x.type === resourceType);
  return resource.displayName || "";
}

function translate(intent) {
  return strings.notification[intent.split(".").join("_")];
}

export const intentMapping = ({ originalEvent, resources }) => {
  const translation = translate(originalEvent.intent);
  if (!translation) return `${originalEvent.intent} (missing intent translation)`;

  const displayName = findDisplayName(originalEvent.intent, resources);

  const text = formatString(translation, displayName);
  return `${text} ${displayName ? "" : strings.notification.no_permissions}`;
};

export const newIntentMapping = ({ businessEvent, resources }) => {
  // const translation = translate(businessEvent.type);
  // TODO: current translation not in line with business types
  const translation = businessEvent.type;
  if (!translation) return `${businessEvent.type} (missing intent translation)`;

  // For now: displayname is not displayed in notification
  // const displayName = findDisplayName(businessEvent.type, resources);
  const displayName = "";

  const text = formatString(translation, displayName);
  return `${text} ${displayName ? "" : strings.notification.no_permissions}`;
};

export const parseURI = ({ resources }) => {
  const project = resources.find(resource => resource.type === "project");
  const subproject = resources.find(resource => resource.type === "subproject");
  if (subproject) {
    return `/projects/${project.id}/${subproject.id}`;
  } else {
    return `/projects/${project.id}`;
  }
};

export const newParseURI = ({ projectId, subprojectId }) => {
  if (projectId && !subprojectId) {
    return `/projects/${projectId}`;
  } else if (projectId && subprojectId) {
    return `/projects/${projectId}/${subprojectId}`;
  } else {
    //ERROR?
  }
};

export const fetchResourceName = (res, type) => {
  const r = res.find(v => v.type === type);
  if (r !== undefined) {
    return r.displayName || strings.workflow.workflow_redacted;
  } else {
    return "-";
  }
};

export const hasAccess = res => res.reduce((acc, r) => acc && r.displayName !== undefined, true);
