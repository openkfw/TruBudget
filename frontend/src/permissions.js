const can = (intentName, intents) => intents.indexOf(intentName) > -1;

// Global intents
export const canCreateProject = i => can("global.createProject", i);

// Project intents
export const canViewProjectPermissions = i => can("project.intent.listPermissions", i);
export const canGrantProjectPermissions = i => can("project.intent.grantPermissions", i);
export const canViewProjectDetails = i => can("project.viewDetails", i);
export const canViewProjectSummary = i => can("project.viewSummary", i);
export const canUpdateProject = i => can("project.update", i);
export const canAssignProject = i => can("project.assign", i);
export const canCloseProject = i => can("project.close", i);
export const canCreateSubProject = i => can("project.createSubproject", i);

// Subproject intents
export const canViewSubProjectPermissions = i => can("subproject.intent.listPermissions", i);
export const canGrantSubProjectPermissions = i => can("subproject.intent.grantPermissions", i);
export const canViewSubProjectDetails = i => can("subproject.viewDetails", i);
export const canViewSubProjectSummary = i => can("subproject.viewSummary", i);
export const canUpdateSubProject = i => can("subproject.update", i);
export const canAssignSubProject = i => can("subproject.assign", i);
export const canCloseSubProject = i => can("subproject.close", i);
export const canCreateWorkflowItems = i => can("subproject.createWorkflowitem", i);
export const canReorderWorkflowItems = i => can("subproject.reorderWorkflowitems", i);

// Workflowitem intents
export const canViewWorkflowItemPermissions = i => can("workflowitem.intent.listPermissions", i);
export const canGrantWorkflowItemPermissions = i => can("workflowitem.intent.grantPermissions", i);
export const canUpdateWorkflowItem = i => can("workflowitem.update", i);
export const canAssignWorkflowItem = i => can("workflowitem.assign", i);
export const canCloseWorkflowItem = i => can("workflowitem.close", i);

// Network intents
export const canViewNodesDashboard = i => can("network.list", i);
export const canApproveNode = i => can("network.voteForPermission", i);

export const globalIntentOrder = [
  {
    name: "admin",
    intents: [
      "global.createUser",
      "global.createGroup",
      "global.createProject",
      "global.listPermissions",
      "global.grantPermission",
      "global.revokePermission",
      "network.list",
      "network.voteForPermission"
    ]
  }
];

export const projectIntentOrder = [
  {
    name: "view",
    intents: ["project.viewSummary", "project.viewDetails"]
  },
  {
    name: "write",
    intents: ["project.createSubproject", "project.update", "project.assign", "project.close"]
  },
  {
    name: "admin",
    intents: ["project.intent.listPermissions", "project.intent.grantPermission", "project.intent.revokePermission"]
  }
];

export const subProjectIntentOrder = [
  {
    name: "view",
    intents: ["subproject.viewSummary", "subproject.viewDetails"]
  },
  {
    name: "write",
    intents: [
      "subproject.createWorkflowitem",
      "subproject.update",
      "subproject.assign",
      "subproject.close",
      "subproject.reorderWorkflowitems"
    ]
  },
  {
    name: "admin",
    intents: [
      "subproject.intent.listPermissions",
      "subproject.intent.grantPermission",
      "subproject.intent.revokePermission"
    ]
  }
];
export const workflowItemIntentOrder = [
  {
    name: "view",
    intents: ["workflowitem.view"]
  },
  {
    name: "write",
    intents: ["workflowitem.assign", "workflowitem.update", "workflowitem.close"]
  },
  {
    name: "admin",
    intents: [
      "workflowitem.intent.listPermissions",
      "workflowitem.intent.grantPermission",
      "workflowitem.intent.revokePermission"
    ]
  }
];
