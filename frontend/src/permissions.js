const can = (intentName, intents) => intents.indexOf(intentName) > -1;

export const canCreateProject = i => can("global.createProject", i);
export const canViewProjectDetails = i => can("project.viewDetails", i);
export const canViewSubProjectDetails = i => can("subproject.viewDetails", i);
export const canViewSubProjectPermissions = i => can("subproject.intent.listPermissions", i);
export const canAssignSubProject = i => can("subproject.assign", i);
export const canCreateWorkflowItems = i => can("subproject.createWorkflowitem", i);
export const canReorderWorkflowItems = i => can("subproject.reorderWorkflowitems", i);
export const canViewWorkflowItemPermissions = i => can("workflowitem.intent.listPermissions", i);
export const canUpdateWorkflowItem = i => can("workflowitem.update", i);
export const canCloseWorkflowItem = i => can("workflowitem.close", i);
export const canAssignWorkflowItem = i => can("workflowitem.assign", i);
export const canViewUserDashboard = i => can("global.createUser", i);
export const canViewNodesDashboard = i => can("network.list", i);
export const canApproveNode = i => can("network.voteForPermission", i);

export const canEditProject = i => can("project.update", i);
export const canEditSubProject = i => can("subproject.update", i);
export const canCloseSubProject = i => can("subproject.close", i);

export const canViewProjectPermissions = i => can("project.intent.listPermissions", i);
export const canCreateSubProject = i => can("project.createSubproject", i);
export const canAssignProject = i => can("project.assign", i);
export const canCloseProject = i => can("project.close", i);


export const globalIntentOrder = [
  {
    name: "admin",
    intents:[
      "global.createUser",
      "global.createGroup",
      "global.createProject",
      "global.listPermissions",
      "global.grantPermission",
      "global.revokePermission"
    ]
  }
]
export const projectIntentOrder = [
  {
    name: "view",
    intents: ["project.viewSummary", "project.viewDetails"]
  },
  {
    name: "write",
    intents: ["project.createSubproject", "project.assign", "project.close"]
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
    intents: ["subproject.createWorkflowitem", "subproject.update", "subproject.assign", "subproject.close", "subproject.reorderWorkflowitems"]
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
