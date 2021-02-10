import _cloneDeep from "lodash/cloneDeep";
import _isEmpty from "lodash/isEmpty";

export function applyOriginalActions(permissions, originalActions, ignoreRevokeActions = false) {
  let permissionsCopy = _cloneDeep(permissions);
  if (!_isEmpty(permissionsCopy.workflowitem)) {
    permissionsCopy = permissionsCopy.workflowitem;
  } else {
    if (!_isEmpty(permissionsCopy.subproject)) {
      permissionsCopy = permissionsCopy.subproject;
    } else {
      permissionsCopy = permissionsCopy.project;
    }
  }
  originalActions.forEach(originalAction => {
    const intent = originalAction.payload.intent;
    if (originalAction.payload.grantee) {
      permissionsCopy[intent].push(originalAction.payload.grantee.id);
    } else {
      if (!ignoreRevokeActions)
        permissionsCopy[intent] = permissionsCopy[intent].filter(user => user !== originalAction.payload.revokee.id);
    }
  });
  return permissionsCopy;
}

function addAdditionalActions(newActions, allActions) {
  if (!_isEmpty(newActions)) {
    newActions = newActions.filter(
      additionalAction =>
        !allActions.some(action => {
          return JSON.stringify(action) === JSON.stringify(additionalAction);
        })
    );
    allActions = allActions.concat(newActions);
  }
  return allActions;
}

function createAdditionalActionsForResource(
  permissions,
  resource,
  intent,
  id,
  displayName,
  identity,
  listPermissionIntentNeededFor
) {
  const viewSummary = `${resource}.viewSummary`;
  const viewDetails = `${resource}.viewDetails`;
  const viewWorkflowitem = `${resource}.view`;
  const listPermissions = `${resource}.intent.listPermissions`;

  let actions = [];
  if (resource !== "workflowitem") {
    if (permissions[viewSummary] === undefined || !permissions[viewSummary].includes(identity)) {
      const action = { intent, id, displayName, permission: viewSummary, identity };
      actions.push(action);
    }
    if (permissions[viewDetails] === undefined || !permissions[viewDetails].includes(identity)) {
      const action = { intent, id, displayName, permission: viewDetails, identity };
      actions.push(action);
    }
  } else {
    if (permissions[viewWorkflowitem] === undefined || !permissions[viewWorkflowitem].includes(identity)) {
      const action = { intent, id, displayName, permission: viewWorkflowitem, identity };
      actions.push(action);
    }
  }
  if (
    listPermissionIntentNeededFor[resource] &&
    (permissions[listPermissions] === undefined || !permissions[listPermissions].includes(identity))
  ) {
    const action = { intent, id, displayName, permission: listPermissions, identity };
    actions.push(action);
  }
  return actions;
}

function createAdditionalActionsforIntent(
  permissions,
  identity,
  project,
  subproject = undefined,
  workflowitem = undefined
) {
  const resources = ["project", "subproject", "workflowitem"];
  const additionalActions = [];

  // Set additional listpermissions for required intents
  let listPermissionIntentNeededFor = { project: false, subproject: false, workflowitem: false };
  if (
    permissions.project &&
    (permissions.project["project.createSubproject"].includes(identity) ||
      permissions.project["project.assign"].includes(identity) ||
      permissions.project["project.intent.grantPermission"].includes(identity) ||
      permissions.project["project.intent.revokePermission"].includes(identity))
  ) {
    listPermissionIntentNeededFor.project = true;
  }

  if (
    permissions.subproject &&
    (permissions.subproject["subproject.createWorkflowitem"].includes(identity) ||
      permissions.subproject["subproject.assign"].includes(identity) ||
      permissions.subproject["subproject.intent.grantPermission"].includes(identity) ||
      permissions.subproject["subproject.intent.revokePermission"].includes(identity))
  ) {
    listPermissionIntentNeededFor.project = true;
    listPermissionIntentNeededFor.subproject = true;
  }

  if (
    permissions.workflowitem &&
    (permissions.workflowitem["workflowitem.assign"].includes(identity) ||
      permissions.workflowitem["workflowitem.intent.grantPermission"].includes(identity) ||
      permissions.workflowitem["workflowitem.intent.revokePermission"].includes(identity))
  ) {
    listPermissionIntentNeededFor.project = true;
    listPermissionIntentNeededFor.subproject = true;
    listPermissionIntentNeededFor.workflowitem = true;
  }

  resources.forEach(res => {
    const resourcePermissions = permissions[res];
    if (!_isEmpty(resourcePermissions)) {
      const intent = res + ".intent.grantPermission";
      let id, displayName;
      switch (res) {
        case "project":
          id = project.id;
          displayName = project.displayName;
          break;

        case "subproject":
          id = subproject.id;
          displayName = subproject.displayName;
          break;

        case "workflowitem":
          id = workflowitem.id;
          displayName = workflowitem.displayName;
          break;

        default:
          id = project.id;
          displayName = project.displayName;
          break;
      }
      const actions = createAdditionalActionsForResource(
        resourcePermissions,
        res,
        intent,
        id,
        displayName,
        identity,
        listPermissionIntentNeededFor
      );
      if (actions.length !== 0) additionalActions.push(...actions);
    }
  });
  return additionalActions;
}

function createWorkflowitemPostActions(workflowitemDisplayname, assignee) {
  const workflowitemPermissions = [
    "workflowitem.view",
    "workflowitem.intent.listPermissions",
    "workflowitem.assign",
    "workflowitem.update",
    "workflowitem.intent.grantPermission",
    "workflowitem.intent.revokePermission"
  ];
  let actions = [];
  workflowitemPermissions.forEach(permission => {
    const action = {
      intent: "workflowitem.intent.grantPermission",
      displayName: workflowitemDisplayname,
      permission,
      identity: assignee
    };
    actions.push(action);
  });
  return actions;
}

export function createAdditionalActions(originalActions, permissions, project, subproject, confirmingUser) {
  let allAdditionalActions = [];
  let allPostActions = [];
  originalActions.forEach((originalAction, index) => {
    const { intent, payload } = originalAction;
    let additionalActions;
    let postActions;
    switch (intent) {
      case "project.assign": {
        const projectPermissions = { project: permissions.project };
        additionalActions = createAdditionalActionsforIntent(projectPermissions, payload.assignee.id, project);
        break;
      }
      case "subproject.assign": {
        const subprojectPermissions = { project: permissions.project, subproject: permissions.subproject };

        additionalActions = createAdditionalActionsforIntent(
          subprojectPermissions,
          payload.assignee.id,
          project,
          subproject
        );
        break;
      }
      case "workflowitem.assign": {
        const workflowitemPermissions = {
          project: permissions.project,
          subproject: permissions.subproject,
          workflowitem: permissions.workflowitem
        };
        const workflowitem = {
          id: payload.workflowitem.id,
          displayName: payload.workflowitem.displayName
        };

        additionalActions = createAdditionalActionsforIntent(
          workflowitemPermissions,
          payload.assignee.id,
          project,
          subproject,
          workflowitem
        );
        break;
      }
      case "subproject.createWorkflowitem": {
        const subprojectPermissions = { project: permissions.project, subproject: permissions.subproject };
        // Check view permissions on project/subproject for assignee
        additionalActions = createAdditionalActionsforIntent(
          subprojectPermissions,
          payload.assignee.id,
          project,
          subproject
        );
        // Grant assignee all permissions after workflowitem creation
        if (payload.assignee.id !== confirmingUser) {
          postActions = createWorkflowitemPostActions(payload.workflowitem.displayName, payload.assignee.id);
        }
        break;
      }
      case "project.intent.grantPermission": {
        let projectPermissions = { project: permissions.project };
        const grantee = payload.grantee;

        if (payload.intent !== "project.viewSummary") {
          projectPermissions.project = applyOriginalActions(projectPermissions, originalActions, true);
          additionalActions = createAdditionalActionsforIntent(projectPermissions, grantee.id, project);
        }
        break;
      }
      case "subproject.intent.grantPermission": {
        let subprojectPermissions = { project: permissions.project, subproject: permissions.subproject };
        const grantee = payload.grantee;

        if (payload.intent !== "subproject.view") {
          subprojectPermissions.subproject = applyOriginalActions(subprojectPermissions, originalActions, true);
          additionalActions = createAdditionalActionsforIntent(subprojectPermissions, grantee.id, project, subproject);
        }
        break;
      }
      case "workflowitem.intent.grantPermission":
        {
          let wPermissions = {
            project: permissions.project,
            subproject: permissions.subproject,
            workflowitem: permissions.workflowitem
          };
          const workflowitem = {
            id: payload.workflowitem.id,
            displayName: payload.workflowitem.displayName
          };
          const grantee = payload.grantee;

          if (payload.intent !== "workflowitem.viewSummary") {
            wPermissions.workflowitem = applyOriginalActions(wPermissions, originalActions, true);
            additionalActions = createAdditionalActionsforIntent(
              wPermissions,
              grantee.id,
              project,
              subproject,
              workflowitem
            );
          }
        }
        break;
      default: {
        break;
      }
    }
    allAdditionalActions = addAdditionalActions(additionalActions, allAdditionalActions);
    allPostActions = addAdditionalActions(postActions, allPostActions);
  });
  return [allAdditionalActions, allPostActions];
}
