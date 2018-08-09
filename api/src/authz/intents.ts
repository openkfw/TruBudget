type Intent =
  | "global.listPermissions"
  | "global.grantPermission"
  | "global.grantAllPermissions"
  | "global.revokePermission"
  | "global.createProject"
  | "global.createUser"
  | "global.createGroup"
  | "user.authenticate"
  | "user.view"
  | "user.intent.listPermissions"
  | "user.intent.grantPermission"
  | "user.intent.revokePermission"
  | "group.addUser"
  | "group.removeUser"
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
  | "network.listActive"
  | "network.voteForPermission"
  | "network.approveNewOrganization"
  | "network.approveNewNodeForExistingOrganization";

export const globalIntents: Intent[] = [
  "global.listPermissions",
  "global.grantPermission",
  "global.grantAllPermissions",
  "global.revokePermission",
  "global.createProject",
  "global.createUser",
  "global.createGroup",
  "user.authenticate",
  "user.intent.listPermissions",
  "user.intent.grantPermission",
  "user.intent.revokePermission",
  "network.registerNode",
  "network.list",
  "network.voteForPermission",
  "network.approveNewOrganization",
  "network.approveNewNodeForExistingOrganization",
];

export const userAssignableIntents: Intent[] = [
  "global.listPermissions",
  "global.grantPermission",
  "global.grantAllPermissions",
  "global.revokePermission",
  "global.createProject",
  "global.createUser",
  "global.createGroup",
  "user.intent.listPermissions",
  "user.intent.grantPermission",
  "user.intent.revokePermission",
  "group.addUser",
  "group.removeUser",
  "notification.list",
  "notification.markRead",
  "network.listActive",
  "network.voteForPermission",
  "network.approveNewOrganization",
  "network.approveNewNodeForExistingOrganization",
];

export const userDefaultIntents: Intent[] = [
  "notification.list",
  "notification.markRead",
  "network.listActive",
];

export const allIntents: Intent[] = [
  "global.listPermissions",
  "global.grantPermission",
  "global.grantAllPermissions",
  "global.revokePermission",
  "global.createProject",
  "global.createUser",
  "global.createGroup",
  "user.authenticate",
  "user.view",
  "user.intent.listPermissions",
  "user.intent.grantPermission",
  "user.intent.revokePermission",
  "group.addUser",
  "group.removeUser",
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
  "network.listActive",
  "network.voteForPermission",
  "network.approveNewOrganization",
  "network.approveNewNodeForExistingOrganization",
];

export default Intent;
