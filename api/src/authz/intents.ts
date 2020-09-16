type Intent =
  | "global.listPermissions"
  | "global.grantPermission"
  | "global.grantAllPermissions"
  | "global.revokePermission"
  | "global.createProject"
  | "global.createUser"
  | "global.enableUser"
  | "global.disableUser"
  | "global.listAssignments"
  | "global.createGroup"
  | "user.authenticate"
  | "user.changePassword"
  | "user.view"
  | "user.intent.listPermissions"
  | "user.intent.grantPermission"
  | "user.intent.revokePermission"
  | "group.addUser"
  | "group.removeUser"
  | "project.intent.listPermissions"
  | "project.intent.grantPermission"
  | "project.intent.revokePermission"
  | "project.viewSummary"
  | "project.viewDetails"
  | "project.viewHistory"
  | "project.assign"
  | "project.update"
  | "project.close"
  | "project.archive"
  | "project.createSubproject"
  | "project.budget.updateProjected"
  | "project.budget.deleteProjected"
  | "subproject.intent.listPermissions"
  | "subproject.intent.grantPermission"
  | "subproject.intent.revokePermission"
  // TODO: rename to subproject.list
  | "subproject.viewSummary"
  | "subproject.viewDetails"
  | "subproject.viewHistory"
  | "subproject.assign"
  | "subproject.update"
  | "subproject.close"
  | "subproject.archive"
  | "subproject.createWorkflowitem"
  | "subproject.reorderWorkflowitems"
  | "subproject.budget.updateProjected"
  | "subproject.budget.deleteProjected"
  | "workflowitem.intent.listPermissions"
  | "workflowitem.intent.grantPermission"
  | "workflowitem.intent.revokePermission"
  | "workflowitem.view"
  | "workflowitem.viewHistory"
  | "workflowitem.assign"
  | "workflowitem.update"
  | "workflowitem.close"
  | "workflowitem.archive"
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
  "global.enableUser",
  "global.disableUser",
  "global.listAssignments",
  "global.createGroup",
  "network.registerNode",
  "network.list",
  "network.listActive",
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
  "global.enableUser",
  "global.disableUser",
  "global.listAssignments",
  "global.createGroup",
  "group.addUser",
  "group.removeUser",
  "network.listActive",
  "network.list",
  "network.voteForPermission",
  "network.approveNewOrganization",
  "network.approveNewNodeForExistingOrganization",
  "user.changePassword",
];

export const userDefaultIntents: Intent[] = ["network.listActive"];

export const userIntents: Intent[] = [
  "user.view",
  "user.authenticate",
  "user.changePassword",
  "user.intent.listPermissions",
  "user.intent.grantPermission",
  "user.intent.revokePermission",
];

export const groupIntents: Intent[] = ["group.addUser", "group.removeUser"];

export const projectIntents: Intent[] = [
  "project.intent.listPermissions",
  "project.intent.grantPermission",
  "project.intent.revokePermission",
  "project.viewSummary",
  "project.viewDetails",
  "project.viewHistory",
  "project.assign",
  "project.update",
  "project.close",
  "project.archive",
  "project.createSubproject",
  "project.budget.updateProjected",
  "project.budget.deleteProjected",
];

export const subprojectIntents: Intent[] = [
  "subproject.intent.listPermissions",
  "subproject.intent.grantPermission",
  "subproject.intent.revokePermission",
  "subproject.viewSummary",
  "subproject.viewDetails",
  "subproject.viewHistory",
  "subproject.assign",
  "subproject.update",
  "subproject.close",
  "subproject.archive",
  "subproject.createWorkflowitem",
  "subproject.reorderWorkflowitems",
  "subproject.budget.updateProjected",
  "subproject.budget.deleteProjected",
];

export const workflowitemIntents: Intent[] = [
  "workflowitem.intent.listPermissions",
  "workflowitem.intent.grantPermission",
  "workflowitem.intent.revokePermission",
  "workflowitem.view",
  "workflowitem.viewHistory",
  "workflowitem.assign",
  "workflowitem.update",
  "workflowitem.close",
  "workflowitem.archive",
];

export const allIntents: Intent[] = [
  "global.listPermissions",
  "global.grantPermission",
  "global.grantAllPermissions",
  "global.revokePermission",
  "global.createProject",
  "global.createUser",
  "global.enableUser",
  "global.disableUser",
  "global.listAssignments",
  "global.createGroup",
  "user.authenticate",
  "user.changePassword",
  "user.intent.listPermissions",
  "user.intent.grantPermission",
  "user.intent.revokePermission",
  "user.view",
  "group.addUser",
  "group.removeUser",
  "project.intent.listPermissions",
  "project.intent.grantPermission",
  "project.intent.revokePermission",
  "project.viewSummary",
  "project.viewDetails",
  "project.viewHistory",
  "project.assign",
  "project.update",
  "project.close",
  "project.archive",
  "project.createSubproject",
  "project.budget.updateProjected",
  "project.budget.deleteProjected",
  "subproject.intent.listPermissions",
  "subproject.intent.grantPermission",
  "subproject.intent.revokePermission",
  "subproject.viewSummary",
  "subproject.viewDetails",
  "subproject.viewHistory",
  "subproject.assign",
  "subproject.update",
  "subproject.close",
  "subproject.archive",
  "subproject.createWorkflowitem",
  "subproject.reorderWorkflowitems",
  "subproject.budget.updateProjected",
  "subproject.budget.deleteProjected",
  "workflowitem.intent.listPermissions",
  "workflowitem.intent.grantPermission",
  "workflowitem.intent.revokePermission",
  "workflowitem.view",
  "workflowitem.viewHistory",
  "workflowitem.assign",
  "workflowitem.update",
  "workflowitem.close",
  "workflowitem.archive",
  "notification.create",
  "network.registerNode",
  "network.list",
  "network.listActive",
  "network.voteForPermission",
  "network.approveNewOrganization",
  "network.approveNewNodeForExistingOrganization",
];

export default Intent;
