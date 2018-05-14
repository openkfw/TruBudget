import { hasIntersection } from ".";
import Intent from "./intents";

const requiredPermissions = new Map<Intent, Intent[]>([
  ["global.intent.grantPermission", ["global.intent.listPermissions"]],
  ["global.intent.revokePermission", ["global.intent.listPermissions"]],
  ["global.createProject", ["project.viewSummary", "project.viewDetails"]],
  ["project.intent.grantPermission", ["project.intent.listPermissions"]],
  ["project.intent.revokePermission", ["project.intent.listPermissions"]],
  ["project.assign", ["project.viewDetails"]],
  ["project.update", ["project.viewDetails"]],
  ["project.close", ["project.viewDetails"]],
  ["project.archive", ["project.viewDetails"]],
  ["project.createSubproject", ["project.viewDetails", "subproject.viewDetails"]],
  ["subproject.intent.grantPermission", ["subproject.intent.listPermissions"]],
  ["subproject.intent.revokePermission", ["subproject.intent.listPermissions"]],
  ["subproject.assign", ["subproject.viewDetails"]],
  ["subproject.update", ["subproject.viewDetails"]],
  ["subproject.close", ["subproject.viewDetails"]],
  ["subproject.archive", ["subproject.viewDetails"]],
  ["subproject.createWorkflowitem", ["subproject.viewDetails", "workflowitem.view"]],
  ["subproject.reorderWorkflowitems", ["subproject.viewDetails", "workflowitem.view"]],
  ["workflowitem.intent.grantPermission", ["workflowitem.intent.listPermissions"]],
  ["workflowitem.intent.revokePermission", ["workflowitem.intent.listPermissions"]],
  ["workflowitem.assign", ["workflowitem.view"]],
  ["workflowitem.update", ["workflowitem.view"]],
  ["workflowitem.close", ["workflowitem.view"]],
  ["workflowitem.archive", ["workflowitem.view"]],
]);

export const isAllowedToSeeEvent = (userIntents: Intent[], observedIntent: Intent): boolean => {
  if (requiredPermissions.has(observedIntent)) {
    const allowedIntents = requiredPermissions.get(observedIntent);
    return hasIntersection(allowedIntents, userIntents);
  } else if (userIntents.includes(observedIntent)) {
    // If not explicitly stated otherwise, always allow to see events related to
    // something the user is already entitled for
    return true;
  } else {
    return false;
  }
};
