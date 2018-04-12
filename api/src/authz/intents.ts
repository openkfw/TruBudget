type Intent =
  | "global.intent.list"
  | "global.intent.grantPermission"
  | "global.intent.revokePermission"
  | "global.createProject"
  | "global.createUser"
  | "user.authenticate"
  | "user.view"
  | "project.intent.list"
  | "project.intent.grantPermission"
  | "project.intent.revokePermission"
  | "project.viewSummary" // IDs + meta data + allowed intents
  | "project.viewDetails" // ID + meta data + allowed intents + history
  | "project.assign"
  | "project.update"
  | "project.close"
  | "project.archive"
  | "project.createSubproject"
  | "subproject.permission.list"
  | "subproject.permission.grant"
  | "subproject.permission.revoke"
  | "subproject.viewSummary"
  | "subproject.viewDetails"
  | "subproject.assign"
  | "subproject.update"
  | "subproject.close"
  | "subproject.archive"
  | "subproject.createWorkflowitem"
  | "workflowitem.permission.list"
  | "workflowitem.permission.grant"
  | "workflowitem.permission.revoke"
  | "workflowitem.viewSummary"
  | "workflowitem.viewDetails"
  | "workflowitem.assign"
  | "workflowitem.update"
  | "workflowitem.close"
  | "workflowitem.archive";

export const globalIntents: Intent[] = [
  "global.intent.list",
  "global.intent.grantPermission",
  "global.intent.revokePermission",
  "global.createProject",
  "global.createUser",
  "user.authenticate"
];

export const userDefaultIntents: Intent[] = ["user.authenticate"];

export default Intent;
