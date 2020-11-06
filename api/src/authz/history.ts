import { hasIntersection } from ".";
import logger from "../lib/logger";
import { Event } from "../service/event";
import Intent from "./intents";

const requiredPermissions = new Map<Intent, Intent[]>([
  ["global.grantPermission", ["global.listPermissions"]],
  ["global.revokePermission", ["global.listPermissions"]],
  ["global.createProject", ["project.viewSummary", "project.viewDetails"]],
  ["project.intent.grantPermission", ["project.intent.listPermissions"]],
  ["project.intent.revokePermission", ["project.intent.listPermissions"]],
  ["project.assign", ["project.viewDetails"]],
  ["project.update", ["project.viewDetails"]],
  ["project.archive", ["project.viewDetails"]],
  ["project.createSubproject", ["project.viewDetails", "subproject.viewDetails"]],
  ["subproject.intent.grantPermission", ["subproject.intent.listPermissions"]],
  ["subproject.intent.revokePermission", ["subproject.intent.listPermissions"]],
  ["subproject.assign", ["subproject.viewDetails"]],
  ["subproject.update", ["subproject.viewDetails"]],
  ["subproject.archive", ["subproject.viewDetails"]],
  ["subproject.createWorkflowitem", ["subproject.viewDetails", "workflowitem.view"]],
  ["subproject.reorderWorkflowitems", ["subproject.viewDetails", "workflowitem.view"]],
  ["workflowitem.intent.grantPermission", ["workflowitem.intent.listPermissions"]],
  ["workflowitem.intent.revokePermission", ["workflowitem.intent.listPermissions"]],
  ["workflowitem.assign", ["workflowitem.view"]],
  ["workflowitem.update", ["workflowitem.view"]],
  ["workflowitem.archive", ["workflowitem.view"]],
]);

export function onlyAllowedData(event: Event, userIntents: Intent[]): Event | null {
  const observedIntent = event.intent;
  if (requiredPermissions.has(observedIntent)) {
    const allowedIntents = requiredPermissions.get(observedIntent);
    const isAllowedToSee = hasIntersection(allowedIntents, userIntents);
    if (!isAllowedToSee) {
      logger.info({ params: { event } }, "User is not allowed to see the selected resource");
      return null;
    }
    return redactEvent(event, userIntents);
  } else if (userIntents.includes(observedIntent)) {
    // If not explicitly stated otherwise, always allow to see events related to
    // something the user is already entitled for
    logger.debug("Permissions not restriced");
    return event;
  } else {
    return null;
  }
}

function redactEvent(event: Event, userIntents: Intent[]): Event {
  if (event.intent === "global.createProject") {
    // Special handling for permissions:
    if (event.dataVersion === 1) {
      if (userIntents.includes("project.intent.listPermissions")) {
        // The user is allowed to see permissions, no need to redact anything:
      } else {
        // The user is not allowed to see the permissions, but he's allowed to _see_ the
        // creation event, so we're filtering out the permissions from the event's data
        // object:
        delete event.data.permissions;
      }
    } else {
      logger.warn(`Unsupportet data version. Expected: 1, Have: ${event.dataVersion}`);
      // Since we don't know what data looks like, we remove it altogether:
      event.data = {};
    }
  } else if (event.intent === "project.createSubproject") {
    // Special handling for permissions:
    if (event.dataVersion === 1) {
      if (userIntents.includes("subproject.intent.listPermissions")) {
        // The user is allowed to see permissions, no need to redact anything:
      } else {
        // The user is not allowed to see the permissions, but he's allowed to _see_ the
        // creation event, so we're filtering out the permissions from the event's data
        // object:
        delete event.data.permissions;
      }
    } else {
      logger.warn(`Unsupportet data version. Expected: 1, Have: ${event.dataVersion}`);
      // Since we don't know what data looks like, we remove it altogether:
      event.data = {};
    }
  } else if (event.intent === "subproject.createWorkflowitem") {
    // Special handling for permissions:
    if (event.dataVersion === 1) {
      if (userIntents.includes("workflowitem.intent.listPermissions")) {
        // The user is allowed to see permissions, no need to redact anything:
      } else {
        // The user is not allowed to see the permissions, but he's allowed to _see_ the
        // creation event, so we're filtering out the permissions from the event's data
        // object:
        delete event.data.permissions;
      }
    } else {
      logger.warn(`Unsupportet data version. Expected: 1, Have: ${event.dataVersion}`);
      // Since we don't know what data looks like, we remove it altogether:
      event.data = {};
    }
  } else {
    // No special handling needed
    logger.debug({ event }, `No special handling for event needed`);
  }
  return event;
}
