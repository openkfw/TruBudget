export const FETCH_PROJECT_DETAILS = "FETCH_PROJECT_DETAILS";
export const FETCH_PROJECT_DETAILS_SUCCESS = "FETCH_PROJECT_DETAILS_SUCCESS";

export const FETCH_PROJECT_PERMISSIONS = "FETCH_PROJECT_PERMISSIONS";
export const FETCH_PROJECT_PERMISSIONS_SUCCESS = "FETCH_PROJECT_PERMISSIONS_SUCCESS";

export const SHOW_SUBPROJECT_DIALOG = "SHOW_SUBPROJECT_DIALOG";
export const CANCEL_SUBPROJECT_DIALOG = "CANCEL_SUBPROJECT_DIALOG";
export const SHOW_SUBPROJECT_DIALOG_SUCCESS = "SHOW_SUBPROJECT_DIALOG_SUCCESS";

export const SHOW_PROJECT_PERMISSIONS = "SHOW_PROJECT_PERMISSIONS";
export const HIDE_PROJECT_PERMISSIONS = "HIDE_PROJECT_PERMISSIONS";

export const GRANT_PERMISSION = "GRANT_PERMISSION";
export const GRANT_PERMISSION_SUCCESS = "GRANT_PERMISSION_SUCCESS";

export const CREATE_SUBPROJECT = "CREATE_SUBPROJECT";
export const CREATE_SUBPROJECT_SUCCESS = "CREATE_SUBPROJECT_SUCCESS";

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

export function fetchAllProjectDetails(projectId, showLoading = false) {
  return {
    type: FETCH_ALL_PROJECT_DETAILS,
    projectId,
    showLoading
  };
}

export function showProjectAssignees() {
  return {
    type: SHOW_PROJECT_ASSIGNEES
  };
}

export function hideProjectAssignees() {
  return {
    type: HIDE_PROJECT_ASSIGNEES
  };
}

export function fetchProjectPermissions(projectId, showLoading = false) {
  return {
    type: FETCH_PROJECT_PERMISSIONS,
    projectId,
    showLoading
  };
}

export function fetchProjectDetails(project) {
  return {
    type: FETCH_PROJECT_DETAILS,
    project
  };
}

export function showProjectPermissions() {
  return {
    type: SHOW_PROJECT_PERMISSIONS
  };
}

export function hideProjectPermissions() {
  return {
    type: HIDE_PROJECT_PERMISSIONS
  };
}

export function grantPermission(projectId, intent, user, showLoading = false) {
  return {
    type: GRANT_PERMISSION,
    projectId,
    intent,
    user,
    showLoading
  };
}

export function assignProject(projectId, assigneeId) {
  return {
    type: ASSIGN_PROJECT,
    projectId,
    assigneeId
  };
}

export function createSubProject(projectId, name, amount, comment, currency, showLoading = false) {
  return {
    type: CREATE_SUBPROJECT,
    projectId,
    name,
    amount,
    comment,
    currency,
    showLoading
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
    type: SHOW_SUBPROJECT_DIALOG
  };
}

export function onSubprojectDialogCancel() {
  return {
    type: CANCEL_SUBPROJECT_DIALOG
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

export function storeSubProjectComment(comment) {
  return {
    type: SUBPROJECT_COMMENT,
    comment: comment
  };
}
