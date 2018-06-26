type Intent =
  | "global.intent.listPermissions"
  | "global.intent.grantPermission"
  | "global.intent.revokePermission"
  | "global.createProject"
  | "global.createUser"
  | "user.authenticate"
  | "user.view"
  | "project.intent.listPermissions"
  | "project.intent.grantPermission"
  | "project.intent.revokePermission"
  | "project.viewSummary" // IDs + meta data + allowed intents
  | "project.viewDetails" // ID + meta data + allowed intents + history
  | "project.assign"
  | "project.update"
  | "project.close"
  | "project.archive"
  | "project.createSubproject"
  | "project.viewHistory"
  | "subproject.intent.listPermissions"
  | "subproject.intent.grantPermission"
  | "subproject.intent.revokePermission"
  | "subproject.viewSummary"
  | "subproject.viewDetails"
  | "subproject.assign"
  | "subproject.update"
  | "subproject.close"
  | "subproject.archive"
  | "subproject.createWorkflowitem"
  | "subproject.reorderWorkflowitems"
  | "subproject.viewHistory"
  | "workflowitem.intent.listPermissions"
  | "workflowitem.intent.grantPermission"
  | "workflowitem.intent.revokePermission"
  | "workflowitem.view"
  | "workflowitem.assign"
  | "workflowitem.update"
  | "workflowitem.close"
  | "workflowitem.archive"
  | "notification.list"
  | "notification.markRead"
  | "notification.create"
  | "network.registerNode"
  | "network.list"
  | "network.voteForPermission";

export const globalIntents: Intent[] = [
  "global.intent.listPermissions",
  "global.intent.grantPermission",
  "global.intent.revokePermission",
  "global.createProject",
  "global.createUser",
  "user.authenticate",
];

export const userDefaultIntents: Intent[] = [
  "user.authenticate",
  "user.view",
  "notification.list",
  "notification.markRead",
];

export const allIntents: Intent[] = [
  "global.intent.listPermissions",
  "global.intent.grantPermission",
  "global.intent.revokePermission",
  "global.createProject",
  "global.createUser",
  "user.authenticate",
  "user.view",
  "project.intent.listPermissions",
  "project.intent.grantPermission",
  "project.intent.revokePermission",
  "project.viewSummary",
  "project.viewDetails",
  "project.assign",
  "project.update",
  "project.close",
  "project.archive",
  "project.createSubproject",
  "project.viewHistory",
  "subproject.intent.listPermissions",
  "subproject.intent.grantPermission",
  "subproject.intent.revokePermission",
  "subproject.viewSummary",
  "subproject.viewDetails",
  "subproject.assign",
  "subproject.update",
  "subproject.close",
  "subproject.archive",
  "subproject.createWorkflowitem",
  "subproject.reorderWorkflowitems",
  "subproject.viewHistory",
  "workflowitem.intent.listPermissions",
  "workflowitem.intent.grantPermission",
  "workflowitem.intent.revokePermission",
  "workflowitem.view",
  "workflowitem.assign",
  "workflowitem.update",
  "workflowitem.close",
  "workflowitem.archive",
  "notification.list",
  "notification.markRead",
  "notification.create",
  "network.registerNode",
  "network.list",
  "network.voteForPermission",
];

export default Intent;
