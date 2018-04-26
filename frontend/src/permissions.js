export const getPermissions = (user, details) => {
  const { assignee, approver, bank } = details;
  const roleName = user.role.roleName;

  return {
    isApprover: approver.indexOf(roleName) > -1,
    isAssignee: assignee.indexOf(roleName) > -1,
    isBank: bank.indexOf(roleName) > -1,
  }
}

const can = (intentName, intents) => intents.indexOf(intentName) > -1;

export const canCreateProject = (i) => can("global.createProject", i);
export const canViewProjectDetails = (i) => can("project.viewDetails", i);
export const canViewSubProjectDetails = (i) => can("subproject.viewDetails", i);
export const canViewSubProjectPermissions = (i) => can("subproject.intent.listPermissions", i);
export const canCreateWorkflowItems = (i) => can("subproject.createWorkflowitem", i);
export const canViewWorkflowItemPermissions = (i) => can("workflowitem.intent.listPermissions", i);

