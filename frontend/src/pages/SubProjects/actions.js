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
export const SUBPROJECT_ORGANIZATION = "SUBPROJECT_ORGANIZATION";

export const SUBPROJECT_PROJECTED_BUDGETS = "SUBPROJECT_PROJECTED_BUDGETS";
export const SUBPROJECT_DELETED_PROJECTED_BUDGET = "SUBPROJECT_DELETED_PROJECTED_BUDGET";

export const FETCH_ALL_PROJECT_DETAILS = "FETCH_ALL_PROJECT_DETAILS";
export const FETCH_ALL_PROJECT_DETAILS_SUCCESS = "FETCH_ALL_PROJECT_DETAILS_SUCCESS";

export const SHOW_PROJECT_ASSIGNEES = "SHOW_PROJECT_ASSIGNEES";
export const HIDE_PROJECT_ASSIGNEES = "HIDE_PROJECT_ASSIGNEES";

export const ASSIGN_PROJECT = "ASSIGN_PROJECT";
export const ASSIGN_PROJECT_SUCCESS = "ASSIGN_PROJECT_SUCCESS";

export const SET_HISTORY_OFFSET = "SET_HISTORY_OFFSET";

export const SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT = "SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT";
export const FETCH_NEXT_PROJECT_HISTORY_PAGE = "FETCH_NEXT_PROJECT_HISTORY_PAGE";
export const FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS = "FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS";

export const CLOSE_PROJECT = "CLOSE_PROJECT";
export const CLOSE_PROJECT_SUCCESS = "CLOSE_PROJECT_SUCCESS";
export const SHOW_SUBPROJECT_PERMISSIONS = "SHOW_SUBPROJECT_PERMISSIONS";
export const SHOW_SUBPROJECT_ADDITIONAL_DATA = "SHOW_SUBPROJECT_ADDITIONAL_DATA";
export const HIDE_SUBPROJECT_ADDITIONAL_DATA = "HIDE_SUBPROJECT_ADDITIONAL_DATA";
export const HIDE_SUBPROJECT_PERMISSIONS = "HIDE_SUBPROJECT_PERMISSIONS";

export const GRANT_SUBPROJECT_PERMISSION = "GRANT_SUBPROJECT_PERMISSION";
export const GRANT_SUBPROJECT_PERMISSION_SUCCESS = "GRANT_SUBPROJECT_PERMISSION_SUCCESS";

export const REVOKE_SUBPROJECT_PERMISSION = "REVOKE_SUBPROJECT_PERMISSION";
export const REVOKE_SUBPROJECT_PERMISSION_SUCCESS = "REVOKE_SUBPROJECT_PERMISSION_SUCCESS";

export const FETCH_SUBPROJECT_PERMISSIONS = "FETCH_SUBPROJECT_PERMISSIONS";
export const FETCH_SUBPROJECT_PERMISSIONS_SUCCESS = "FETCH_SUBPROJECT_PERMISSIONS_SUCCESS";
export const FETCH_SUBPROJECT_PERMISSIONS_FAILURE = "FETCH_SUBPROJECT_PERMISSIONS_FAILURE";

export const LIVE_UPDATE_PROJECT = "LIVE_UPDATE_PROJECT";

export const OPEN_HISTORY = "OPEN_HISTORY";

export const ADD_TEMPORARY_SUBPROJECT_PERMISSION = "ADD_TEMPORARY_SUBPROJECT_PERMISSION";
export const REMOVE_TEMPORARY_SUBPROJECT_PERMISSION = " REMOVE_TEMPORARY_SUBPROJECT_PERMISSION";

export const SUB_SEARCH_TERM = "SUB_SEARCH_TERM";
export const SUB_SEARCH_BAR_DISPLAYED = "SUB_SEARCH_BAR_DISPLAYED";
export const SUB_STORE_FILTERED_PROJECTS = "SUB_STORE_FILTERED_PROJECTS";
export const SUB_STORE_HIGHLIGHTING_REGEX = "SUB_STORE_HIGHLIGHTING_REGEX";
export const SUB_STORE_SEARCH_TERMS_AS_ARRAY = "SUB_STORE_SEARCH_TERMS_AS_ARRAY";

export function fetchSubProjectPermissions(projectId, subprojectId, showLoading = false) {
  return {
    type: FETCH_SUBPROJECT_PERMISSIONS,
    projectId,
    subprojectId,
    showLoading
  };
}

export function grantSubProjectPermission(
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  intent,
  granteeId,
  granteeDisplayName,
  showLoading = false
) {
  return {
    type: GRANT_SUBPROJECT_PERMISSION,
    projectId,
    projectDisplayName,
    subprojectId,
    subprojectDisplayName,
    intent,
    granteeId,
    granteeDisplayName,
    showLoading
  };
}

export function revokeSubProjectPermission(
  projectId,
  projectDisplayName,
  subprojectId,
  subprojectDisplayName,
  intent,
  revokeeId,
  revokeeDisplayName,
  showLoading = false
) {
  return {
    type: REVOKE_SUBPROJECT_PERMISSION,
    projectId,
    projectDisplayName,
    subprojectId,
    subprojectDisplayName,
    intent,
    revokeeId,
    revokeeDisplayName,
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

export function setTotalHistoryItemCount(count) {
  return {
    type: SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT,
    count
  };
}

export function fetchNextProjectHistoryPage(projectId, showLoading = false) {
  return {
    type: FETCH_NEXT_PROJECT_HISTORY_PAGE,
    projectId,
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

export function assignProject(projectId, projectDisplayName, assigneeId, assigneeDisplayName, showLoading = false) {
  return {
    type: ASSIGN_PROJECT,
    projectId,
    projectDisplayName,
    assigneeId,
    assigneeDisplayName
  };
}

export function createSubProject(projectId, name, description, currency, projectedBudgets, showLoading = false) {
  return {
    type: CREATE_SUBPROJECT,
    projectId,
    name,
    description,
    currency,
    projectedBudgets,
    showLoading
  };
}
export function editSubproject(projectId, subprojectId, changes, deletedProjectedBudgets) {
  return {
    type: EDIT_SUBPROJECT,
    projectId,
    subprojectId,
    changes,
    deletedProjectedBudgets
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

export function storeSubProjectCurrency(currency) {
  return {
    type: SUBPROJECT_CURRENCY,
    currency: currency
  };
}

export function storeSubProjectProjectedBudgets(projectedBudgets) {
  return {
    type: SUBPROJECT_PROJECTED_BUDGETS,
    projectedBudgets: projectedBudgets
  };
}

export function storeSubProjectComment(description) {
  return {
    type: SUBPROJECT_COMMENT,
    description
  };
}

export function storeDeletedProjectedBudget(projectedBudgets) {
  return {
    type: SUBPROJECT_DELETED_PROJECTED_BUDGET,
    projectedBudgets: projectedBudgets
  };
}

export function showEditDialog(id, name, description, currency, projectedBudgets) {
  return {
    type: SHOW_SUBPROJECT_EDIT,
    id,
    name,
    description,
    currency,
    projectedBudgets
  };
}
export function showSubProjectPermissions(id, displayName) {
  return {
    type: SHOW_SUBPROJECT_PERMISSIONS,
    id,
    displayName
  };
}

export function showSubProjectAdditionalData(id) {
  return {
    type: SHOW_SUBPROJECT_ADDITIONAL_DATA,
    id
  };
}

export function hideSubProjectAdditionalData() {
  return {
    type: HIDE_SUBPROJECT_ADDITIONAL_DATA
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

export function showHistory() {
  return {
    type: OPEN_HISTORY
  };
}

export function addTemporaryPermission(permission, userId) {
  return {
    type: ADD_TEMPORARY_SUBPROJECT_PERMISSION,
    permission,
    userId
  };
}

export function removeTemporaryPermission(permission, userId) {
  return {
    type: REMOVE_TEMPORARY_SUBPROJECT_PERMISSION,
    permission,
    userId
  };
}

export function storeSubSearchTerm(searchTerm) {
  return {
    type: SUB_SEARCH_TERM,
    searchTerm
  };
}

export function storeSubSearchBarDisplayed(searchBarDisplayed) {
  return {
    type: SUB_SEARCH_BAR_DISPLAYED,
    searchBarDisplayed
  };
}
export function storeFilteredSubProjects(filteredSubProjects) {
  return {
    type: SUB_STORE_FILTERED_PROJECTS,
    filteredSubProjects
  };
}

export function storeSubHighlightingRegex(highlightingRegex) {
  return {
    type: SUB_STORE_HIGHLIGHTING_REGEX,
    highlightingRegex
  };
}

export function storeSubSearchTermArray(searchTerms) {
  return {
    type: SUB_STORE_SEARCH_TERMS_AS_ARRAY,
    searchTerms
  };
}
