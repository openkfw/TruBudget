import _cloneDeep from "lodash/cloneDeep";
import _isEmpty from "lodash/isEmpty";
import { getGroupsOfUser, isUserOrGroupPermitted} from "./../../helper.js";

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
  confirmingUser,
  groupsOfConfirmingUser,
  displayName,
  identity,
  listPermissionIntentNeededFor,
  groupsOfUser = []
) {
  const viewSummary = `${resource}.viewSummary`;
  const viewDetails = `${resource}.viewDetails`;
  const viewWorkflowitem = `${resource}.view`;
  const listPermissions = `${resource}.intent.listPermissions`;

  let actions = [];

  if (resource !== "workflowitem") {
    if (permissions[viewSummary] === undefined || !isUserOrGroupPermitted(identity, groupsOfUser, permissions[viewSummary])) {
      const action = { intent, id, displayName, permission: viewSummary, identity, isUserPermitted: isUserOrGroupPermitted(confirmingUser, groupsOfConfirmingUser, permissions[intent]) };
      actions.push(action);
    }

    if (permissions[viewDetails] === undefined || !isUserOrGroupPermitted(identity, groupsOfUser, permissions[viewDetails])) {
      const action = { intent, id, displayName, permission: viewDetails, identity, isUserPermitted: isUserOrGroupPermitted(confirmingUser, groupsOfConfirmingUser, permissions[intent]) };
      actions.push(action);
    }
  } else {
    if (permissions[viewWorkflowitem] === undefined || !isUserOrGroupPermitted(identity, groupsOfUser, permissions[viewWorkflowitem])) {
      const action = { intent, id, displayName, permission: viewWorkflowitem, identity, isUserPermitted: isUserOrGroupPermitted(confirmingUser, groupsOfConfirmingUser, permissions[intent]) };
      actions.push(action);
    }

  }

  if (
    listPermissionIntentNeededFor[resource] &&
    (permissions[listPermissions] === undefined || !isUserOrGroupPermitted(identity, groupsOfUser, permissions[listPermissions]))
  ) {
    const action = { intent, id, displayName, permission: listPermissions, identity, isUserPermitted: isUserOrGroupPermitted(confirmingUser, groupsOfConfirmingUser, permissions[intent]) };
    actions.push(action);
  }
  return actions;
}

function createAdditionalActionsforIntent({
  permissions,
  identity,
  confirmingUser,
  project,
  groups = [],
  subproject = undefined,
  workflowitem = undefined,
  isSubprojectValidator = false,
  isWorkflowitemDefaultAssignee = false
}) {
  const resources = ["project", "subproject", "workflowitem"];
  const additionalActions = [];
  const groupsOfUser = getGroupsOfUser(identity, groups);

  // Set additional listpermissions for required intents
  let listPermissionIntentNeededFor = { project: false, subproject: false, workflowitem: false };
  if (
    permissions.project &&
    (
      isUserOrGroupPermitted(identity, groupsOfUser, permissions.project["project.createSubproject"]) ||
      isUserOrGroupPermitted(identity, groupsOfUser, permissions.project["project.assign"]) ||
      isUserOrGroupPermitted(identity, groupsOfUser, permissions.project["project.intent.grantPermission"]) ||
      isUserOrGroupPermitted(identity, groupsOfUser, permissions.project["project.intent.revokePermission"]))) {
    listPermissionIntentNeededFor.project = true;
  }

  if (
    (permissions.subproject &&
      (
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.subproject["subproject.createWorkflowitem"]) ||
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.subproject["subproject.assign"]) ||
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.subproject["subproject.intent.grantPermission"]) ||
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.subproject["subproject.intent.revokePermission"]))) ||
    isSubprojectValidator
  ) {
    listPermissionIntentNeededFor.project = true;
    listPermissionIntentNeededFor.subproject = true;
  }

  if (
    (permissions.workflowitem &&
      (
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.workflowitem["workflowitem.assign"]) ||
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.workflowitem["workflowitem.intent.grantPermission"]) ||
        isUserOrGroupPermitted(identity, groupsOfUser, permissions.workflowitem["workflowitem.intent.revokePermission"]))) ||
    isWorkflowitemDefaultAssignee
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
        confirmingUser,
        getGroupsOfUser(confirmingUser, groups),
        displayName,
        identity,
        listPermissionIntentNeededFor,
        groupsOfUser
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

function createSuprojectPostActions(subprojectDisplayname, validator) {
  const subprojectPermissions = [
    "subproject.viewDetails",
    "subproject.viewSummary",
    "subproject.intent.listPermissions"
  ];
  let actions = [];
  subprojectPermissions.forEach(permission => {
    const action = {
      intent: "subproject.intent.grantPermission",
      displayName: subprojectDisplayname,
      permission,
      identity: validator
    };
    actions.push(action);
  });
  return actions;
}

export function createAdditionalActions(originalActions, permissions, project, subproject, confirmingUser, groups = []) {
  let allAdditionalActions = [];
  let allPostActions = [];

  originalActions.forEach((originalAction, index) => {
    const { intent, payload } = originalAction;
    let additionalActions;
    let postActions;

    switch (intent) {
      case "project.assign": {
        const projectPermissions = { project: permissions.project };
        additionalActions = createAdditionalActionsforIntent({
          permissions: projectPermissions,
          identity: payload.assignee.id,
          confirmingUser,
          project,
          groups
        });
        break;
      }

      case "project.createSubproject": {
        if (!_isEmpty(payload.validator?.id)) {
          const projectPermissions = { project: permissions.project };
          additionalActions = createAdditionalActionsforIntent({
            permissions: projectPermissions,
            identity: payload.validator.id,
            confirmingUser,
            project,
            isSubprojectValidator: true
          });
          // Grant validator all permissions after subproject creation
          if (payload.validator.id !== confirmingUser) {
            postActions = createSuprojectPostActions(payload.subproject.displayName, payload.validator.id);
          }
        }
        break;
      }

      case "subproject.assign": {
        const subprojectPermissions = { project: permissions.project, subproject: permissions.subproject };

        additionalActions = createAdditionalActionsforIntent({
          permissions: subprojectPermissions,
          identity: payload.assignee.id,
          confirmingUser,
          project,
          subproject,
          groups
        });
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

        additionalActions = createAdditionalActionsforIntent({
          permissions: workflowitemPermissions,
          identity: payload.assignee.id,
          confirmingUser,
          project,
          subproject,
          workflowitem,
          groups
        });
        break;
      }

      case "subproject.createWorkflowitem": {
        const subprojectPermissions = { project: permissions.project, subproject: permissions.subproject };

        // Check view permissions on project/subproject for assignee
        additionalActions = createAdditionalActionsforIntent({
          permissions: subprojectPermissions,
          identity: payload.assignee.id,
          confirmingUser,
          project,
          subproject,
          isWorkflowitemDefaultAssignee: true,
          groups
        });
        // Grant assignee all permissions after workflowitem creation
        // If workflowitemType is restricted, the permissions of the creator are revoked in the API
        if (payload.assignee.id !== confirmingUser && payload.workflowitem.workflowitemType !== "restricted") {
          postActions = createWorkflowitemPostActions(payload.workflowitem.displayName, payload.assignee.id);
        }
        break;
      }

      case "project.intent.grantPermission": {
        let projectPermissions = { project: permissions.project };
        const grantee = payload.grantee;

        if (payload.intent !== "project.viewSummary") {
          projectPermissions.project = applyOriginalActions(projectPermissions, originalActions, true);
          additionalActions = createAdditionalActionsforIntent({
            permissions: projectPermissions,
            identity: grantee.id,
            confirmingUser,
            project
          });
        }
        break;
      }

      case "subproject.intent.grantPermission": {
        let subprojectPermissions = { project: permissions.project, subproject: permissions.subproject };
        const grantee = payload.grantee;

        if (payload.intent !== "subproject.viewSummary") {
          subprojectPermissions.subproject = applyOriginalActions(subprojectPermissions, originalActions, true);
          additionalActions = createAdditionalActionsforIntent({
            permissions: subprojectPermissions,
            identity: grantee.id,
            confirmingUser,
            project,
            subproject
          });
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
            additionalActions = createAdditionalActionsforIntent({
              permissions: wPermissions,
              identity: grantee.id,
              confirmingUser,
              project,
              subproject,
              workflowitem
            });
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
