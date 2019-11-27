export function executeOriginalActions(
  actions,
  assignProject,
  assignSubproject,
  assignWorkflowitem,
  grantProjectPermission,
  revokeProjectPermission,
  grantSubprojectPermission,
  revokeSubprojectPermission,
  grantWorkflowitemPermission,
  revokeWorkflowitemPermission
) {
  actions.forEach(action => {
    switch (action.intent) {
      case "project.intent.grantPermission": {
        const project = action.payload.project;
        const intent = action.payload.intent;
        const grantee = action.payload.grantee;
        grantProjectPermission(project.id, project.displayName, intent, grantee.id, grantee.displayName);
        break;
      }
      case "project.intent.revokePermission": {
        const project = action.payload.project;
        const intent = action.payload.intent;
        const revokee = action.payload.revokee;
        revokeProjectPermission(project.id, project.displayName, intent, revokee.id, revokee.displayName);
        break;
      }
      case "project.assign": {
        const project = action.payload.project;
        const assignee = action.payload.assignee;
        assignProject(project.id, project.displayName, assignee.id, assignee.displayName);
        break;
      }
      case "subproject.intent.grantPermission": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const intent = action.payload.intent;
        const grantee = action.payload.grantee;
        grantSubprojectPermission(
          project.id,
          project.displayName,
          subproject.id,
          subproject.displayName,
          intent,
          grantee.id,
          grantee.displayName
        );
        break;
      }
      case "subproject.intent.revokePermission": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const intent = action.payload.intent;
        const revokee = action.payload.revokee;
        revokeSubprojectPermission(
          project.id,
          project.displayName,
          subproject.id,
          subproject.displayName,
          intent,
          revokee.id,
          revokee.displayName
        );
        break;
      }
      case "subproject.assign": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const assignee = action.payload.assignee;
        assignSubproject(
          project.id,
          project.displayName,
          subproject.id,
          subproject.displayName,
          assignee.id,
          assignee.displayName
        );
        break;
      }
      case "workflowitem.intent.grantPermission": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const workflowitem = action.payload.workflowitem;
        const intent = action.payload.intent;
        const grantee = action.payload.grantee;
        grantWorkflowitemPermission(
          project.id,
          project.displayName,
          subproject.id,
          subproject.displayName,
          workflowitem.id,
          workflowitem.displayName,
          intent,
          grantee.id,
          grantee.displayName
        );
        break;
      }
      case "workflowitem.intent.revokePermission": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const workflowitem = action.payload.workflowitem;
        const intent = action.payload.intent;
        const revokee = action.payload.revokee;
        revokeWorkflowitemPermission(
          project.id,
          project.displayName,
          subproject.id,
          subproject.displayName,
          workflowitem.id,
          workflowitem.displayName,
          intent,
          revokee.id,
          revokee.displayName
        );
        break;
      }
      case "workflowitem.assign": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const workflowitem = action.payload.workflowitem;
        const assignee = action.payload.assignee;
        assignWorkflowitem(
          project.id,
          project.displayName,
          subproject.id,
          subproject.displayName,
          workflowitem.id,
          workflowitem.displayName,
          assignee.id,
          assignee.displayName
        );
        break;
      }
      default:
        break;
    }
  });
}
