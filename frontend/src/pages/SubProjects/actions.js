export const FETCH_PROJECT_DETAILS = "FETCH_PROJECT_DETAILS";
export const FETCH_PROJECT_DETAILS_SUCCESS = "FETCH_PROJECT_DETAILS_SUCCESS";

export const SHOW_SUBPROJECT_CREATE = "SHOW_SUBPROJECT_CREATE";
export const HIDE_SUBPROJECT_DIALOG = "HIDE_SUBPROJECT_DIALOG";

export const SHOW_SUBPROJECT_EDIT = "SHOW_SUBPROJECT_EDIT";

export const CREATE_SUBPROJECT = "CREATE_SUBPROJECT";
export const CREATE_SUBPROJECT_SUCCESS = "CREATE_SUBPROJECT_SUCCESS";

export const EDIT_SUBPROJECT = "EDIT_SUBPROJECT";
export const EDIT_SUBPROJECT_SUCCESS = "EDIT_SUBPROJECT_SUCCESS";

export const SUBPROJECT_NAME = "SUBPROJECT_NAME";
export const SUBPROJECT_AMOUNT = "SUBPROJECT_AMOUNT";
export const SUBPROJECT_COMMENT = "SUBPROJECT_COMMENT";
export const SUBPROJECT_CURRENCY = "SUBPROJECT_CURRENCY";

export const FETCH_ALL_PROJECT_DETAILS = "FETCH_ALL_PROJECT_DETAILS";
export const FETCH_ALL_PROJECT_DETAILS_SUCCESS = "FETCH_ALL_PROJECT_DETAILS_SUCCESS";

export const SHOW_PROJECT_ASSIGNEES = "SHOW_PROJECT_ASSIGNEES";
export const HIDE_PROJECT_ASSIGNEES = "HIDE_PROJECT_ASSIGNEES";

export const ASSIGN_PROJECT = "ASSIGN_PROJECT";
export const ASSIGN_PROJECT_SUCCESS = "ASSIGN_PROJECT_SUCCESS";

export const SET_HISTORY_OFFSET = "SET_HISTORY_OFFSET";

export const FETCH_PROJECT_HISTORY = "FETCH_PROJECT_HISTORY";
export const FETCH_PROJECT_HISTORY_SUCCESS = "FETCH_PROJECT_HISTORY_SUCCESS";

export const CLOSE_PROJECT = "CLOSE_PROJECT";
export const CLOSE_PROJECT_SUCCESS = "CLOSE_PROJECT_SUCCESS";
export const SHOW_SUBPROJECT_PERMISSIONS = "SHOW_SUBPROJECT_PERMISSIONS";
export const HIDE_SUBPROJECT_PERMISSIONS = "HIDE_SUBPROJECT_PERMISSIONS";

export const GRANT_SUBPROJECT_PERMISSION = "GRANT_SUBPROJECT_PERMISSION";
export const GRANT_SUBPROJECT_PERMISSION_SUCCESS = "GRANT_SUBPROJECT_PERMISSION_SUCCESS";

export const REVOKE_SUBPROJECT_PERMISSION = "REVOKE_SUBPROJECT_PERMISSION";
export const REVOKE_SUBPROJECT_PERMISSION_SUCCESS = "REVOKE_SUBPROJECT_PERMISSION_SUCCESS";

export const FETCH_SUBPROJECT_PERMISSIONS = "FETCH_SUBPROJECT_PERMISSIONS";
export const FETCH_SUBPROJECT_PERMISSIONS_SUCCESS = "FETCH_SUBPROJECT_PERMISSIONS_SUCCESS";

export const LIVE_UPDATE_PROJECT = "LIVE_UPDATE_PROJECT";
export const LIVE_UPDATE_PROJECT_SUCCESS = "LIVE_UPDATE_PROJECT_SUCCESS";

export function fetchSubProjectPermissions(projectId, subprojectId, showLoading = false) {
  return {
    type: FETCH_SUBPROJECT_PERMISSIONS,
    projectId,
    subprojectId,
    showLoading
  };
}

export function grantSubProjectPermission(projectId, subprojectId, intent, identity, showLoading = false) {
  return {
    type: GRANT_SUBPROJECT_PERMISSION,
    projectId,
    subprojectId,
    intent,
    identity,
    showLoading
  };
}

export function revokeSubProjectPermission(projectId, subprojectId, intent, identity, showLoading = false) {
  return {
    type: REVOKE_SUBPROJECT_PERMISSION,
    projectId,
    subprojectId,
    intent,
    identity,
    showLoading
  };
}

export function fetchAllProjectDetails(projectId, showLoading = false) {
  return {
    type: FETCH_ALL_PROJECT_DETAILS,
    projectId,
    showLoading
  };
}

export function setProjectHistoryOffset(offset) {
  return {
    type: SET_HISTORY_OFFSET,
    offset
  };
}

export function fetchProjectHistory(projectId, offset, limit, showLoading = false) {
  return {
    type: FETCH_PROJECT_HISTORY,
    projectId,
    offset,
    limit,
    showLoading
  };
}

export function hideProjectAssignees() {
  return {
    type: HIDE_PROJECT_ASSIGNEES
  };
}

export function fetchProjectDetails(project) {
  return {
    type: FETCH_PROJECT_DETAILS,
    project
  };
}

export function showProjectAssignees() {
  return {
    type: SHOW_PROJECT_ASSIGNEES
  };
}

export function assignProject(projectId, assigneeId) {
  return {
    type: ASSIGN_PROJECT,
    projectId,
    assigneeId
  };
}

export function createSubProject(projectId, name, amount, description, currency, showLoading = false) {
  return {
    type: CREATE_SUBPROJECT,
    projectId,
    name,
    amount,
    description,
    currency,
    showLoading
  };
}
export function editSubproject(projectId, subprojectId, changes) {
  return {
    type: EDIT_SUBPROJECT,
    projectId,
    subprojectId,
    changes
  };
}

export function storeSubProjectName(name) {
  return {
    type: SUBPROJECT_NAME,
    name: name
  };
}

export function showSubprojectDialog() {
  return {
    type: SHOW_SUBPROJECT_CREATE
  };
}

export function hideSubprojectDialog() {
  return {
    type: HIDE_SUBPROJECT_DIALOG
  };
}

export function storeSubProjectAmount(amount) {
  return {
    type: SUBPROJECT_AMOUNT,
    amount: amount
  };
}

export function storeSubProjectCurrency(currency) {
  return {
    type: SUBPROJECT_CURRENCY,
    currency: currency
  };
}

export function storeSubProjectComment(description) {
  return {
    type: SUBPROJECT_COMMENT,
    description
  };
}

export function showEditDialog(id, name, description, amount, currency) {
  return {
    type: SHOW_SUBPROJECT_EDIT,
    id,
    name,
    description,
    amount,
    currency
  };
}
export function showSubProjectPermissions(id) {
  return {
    type: SHOW_SUBPROJECT_PERMISSIONS,
    id
  };
}

export function hideSubProjectPermissions() {
  return {
    type: HIDE_SUBPROJECT_PERMISSIONS
  };
}

export function closeProject(projectId, showLoading = false) {
  return {
    type: CLOSE_PROJECT,
    projectId,
    showLoading
  };
}

export function liveUpdateProject(projectId) {
  return {
    type: LIVE_UPDATE_PROJECT,
    projectId
  };
}
