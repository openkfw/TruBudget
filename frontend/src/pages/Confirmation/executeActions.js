export function executeActions(
  actions,
  assignProject,
  assignSubproject,
  assignWorkflowitem,
  createWorkflowitem,
  createSubProject,
  grantProjectPermission,
  revokeProjectPermission,
  grantSubprojectPermission,
  revokeSubprojectPermission,
  grantWorkflowitemPermission,
  revokeWorkflowitemPermission,
  closeProject,
  closeSubproject,
  closeWorkflowItem,
  disableUser,
  enableUser
) {
  actions.forEach((action) => {
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
      case "project.createSubproject": {
        createSubProject(
          action.payload.project.id,
          action.payload.project.displayName,
          action.payload.subproject.displayName,
          action.payload.subproject.description,
          action.payload.subproject.currency,
          action.payload.subproject.validator,
          action.payload.subproject.workflowitemType,
          action.payload.subproject.projectedBudgets
        );
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
      case "subproject.createWorkflowitem": {
        const {
          projectId,
          subprojectId,
          displayName,
          amount,
          exchangeRate,
          amountType,
          currency,
          description,
          status,
          documents,
          dueDate,
          workflowitemType,
          projectDisplayName,
          subprojectDisplayName,
          assignee,
          assigneeDisplayName,
          tags
        } = action.payload.workflowitem;
        createWorkflowitem(
          projectId,
          subprojectId,
          displayName,
          amount,
          exchangeRate,
          amountType,
          currency,
          description,
          status,
          documents,
          dueDate,
          workflowitemType,
          projectDisplayName,
          subprojectDisplayName,
          assignee,
          assigneeDisplayName,
          tags
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
      case "project.close": {
        const project = action.payload.project;
        closeProject(project.id);
        break;
      }
      case "subproject.close": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        closeSubproject(project.id, subproject.id);
        break;
      }
      case "workflowitem.close": {
        const project = action.payload.project;
        const subproject = action.payload.subproject;
        const workflowitem = action.payload.workflowitem;
        const isRejectDialog = action.payload.isRejectDialog;
        closeWorkflowItem(project.id, subproject.id, workflowitem.id, isRejectDialog);
        break;
      }
      case "global.disableUser": {
        const userId = action.payload.userId;
        disableUser(userId);
        break;
      }
      case "global.enableUser": {
        const userId = action.payload.userId;
        enableUser(userId);
        break;
      }
      default:
        break;
    }
  });
}
