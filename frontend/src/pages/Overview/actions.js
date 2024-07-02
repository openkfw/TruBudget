export const CREATE_PROJECT = "CREATE_PROJECT";
export const CREATE_PROJECT_SUCCESS = "CREATE_PROJECT_SUCCESS";

export const FETCH_ALL_PROJECTS = "FETCH_ALL_PROJECTS";
export const FETCH_ALL_PROJECTS_SUCCESS = "FETCH_ALL_PROJECTS_SUCCESS";

export const FETCH_PROJECTS_V2 = "FETCH_PROJECTS_V2";
export const FETCH_PROJECTS_V2_SUCCESS = "FETCH_PROJECTS_V2_SUCCESS";

export const LIVE_UPDATE_ALL_PROJECTS = "LIVE_UPDATE_ALL_PROJECTS";
export const LIVE_UPDATE_ALL_PROJECTS_DISABLE = "LIVE_UPDATE_ALL_PROJECTS_DISABLE";
export const LIVE_UPDATE_ALL_PROJECTS_ENABLE = "LIVE_UPDATE_ALL_PROJECTS_ENABLE";

export const SHOW_CREATION_DIALOG = "SHOW_CREATION_DIALOG";
export const HIDE_PROJECT_DIALOG = "HIDE_CREATION_DIALOG";

export const SHOW_EDIT_DIALOG = "SHOW_EDIT_DIALOG";
export const HIDE_EDIT_DIALOG = "HIDE_EDIT_DIALOG";

export const PROJECT_NAME = "PROJECT_NAME";
export const ADD_PROJECT_PROJECTED_BUDGET = "ADD_PROJECT_PROJECTED_BUDGET";
export const EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT = "EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT";
export const PROJECT_DELETED_PROJECTED_BUDGET = "PROJECT_DELETED_PROJECTED_BUDGET";
export const PROJECT_COMMENT = "PROJECT_COMMENT";
export const PROJECT_THUMBNAIL = "PROJECT_THUMBNAIL";
export const PROJECT_CREATION_STEP = "PROJECT_CREATION_STEP";

export const SHOW_PROJECT_PERMISSIONS = "SHOW_PROJECT_PERMISSIONS";
export const HIDE_PROJECT_PERMISSIONS = "HIDE_PROJECT_PERMISSIONS";

export const SHOW_PROJECT_ADDITIONAL_DATA = "SHOW_PROJECT_ADDITIONAL_DATA";
export const HIDE_PROJECT_ADDITIONAL_DATA = "HIDE_PROJECT_ADDITIONAL_DATA";

export const EDIT_PROJECT = "EDIT_PROJECT";
export const EDIT_PROJECT_SUCCESS = "EDIT_PROJECT_SUCCESS";
export const FETCH_PROJECT_PERMISSIONS = "FETCH_PROJECT_PERMISSIONS";
export const FETCH_PROJECT_PERMISSIONS_SUCCESS = "FETCH_PROJECT_PERMISSIONS_SUCCESS";
export const FETCH_PROJECT_PERMISSIONS_FAILURE = "FETCH_PROJECT_PERMISSIONS_FAILURE";

export const GRANT_PROJECT_PERMISSION = "GRANT_PROJECT_PERMISSION";
export const GRANT_PROJECT_PERMISSION_SUCCESS = "GRANT_PROJECT_PERMISSION_SUCCESS";
export const GRANT_PROJECT_PERMISSION_FAILURE = "GRANT_PROJECT_PERMISSION_FAILURE";

export const REVOKE_PROJECT_PERMISSION = "REVOKE_PROJECT_PERMISSION";
export const REVOKE_PROJECT_PERMISSION_SUCCESS = "REVOKE_PROJECT_PERMISSION_SUCCESS";
export const REVOKE_PROJECT_PERMISSION_FAILURE = "REVOKE_PROJECT_PERMISSION_FAILURE";

export const ADD_PROJECT_TAG = "ADD_PROJECT_TAG";
export const REMOVE_PROJECT_TAG = "REMOVE_PROJECT_TAG";

export const ADD_PROJECT_CUSTOM_IMAGE = "ADD_PROJECT_CUSTOM_IMAGE";
export const REMOVE_PROJECT_CUSTOM_IMAGE = "REMOVE_PROJECT_CUSTOM_IMAGE";

export const ADD_TEMPORARY_PROJECT_PERMISSION = "ADD_TEMPORARY_PROJECT_PERMISSION";
export const REMOVE_TEMPORARY_PROJECT_PERMISSION = " REMOVE_TEMPORARY_PROJECT_PERMISSION";

export const STORE_FILTERED_PROJECTS = "STORE_FILTERED_PROJECTS";
export const STORE_SEARCH_TERMS_AS_ARRAY = "STORE_SEARCH_TERMS_AS_ARRAY";

export const STORE_PROJECT_VIEW = "STORE_PROJECT_VIEW";

export const SET_PAGE = "SET_PAGE";
export const SET_ROWS_PER_PAGE = "SET_ROWS_PER_PAGE";
export const SET_SORT = "SET_SORT";

export function fetchAllProjects(showLoading = false) {
  return {
    type: FETCH_ALL_PROJECTS,
    showLoading
  };
}

export function liveUpdateAllProjects(showLoading = false) {
  return {
    type: LIVE_UPDATE_ALL_PROJECTS,
    showLoading
  };
}

export function disableAllProjectsLiveUpdates() {
  return {
    type: LIVE_UPDATE_ALL_PROJECTS_DISABLE
  };
}

export function enableAllProjectsLiveUpdates() {
  return {
    type: LIVE_UPDATE_ALL_PROJECTS_ENABLE
  };
}

export function createProject(name, comment, thumbnail, projectedBudgets, tags) {
  return {
    type: CREATE_PROJECT,
    name,
    comment,
    thumbnail,
    projectedBudgets,
    tags
  };
}

export function editProject(projectId, changes, deletedProjectedBudgets) {
  return {
    type: EDIT_PROJECT,
    projectId,
    changes,
    deletedProjectedBudgets
  };
}

export function fetchProjectPermissions(projectId, showLoading = false) {
  return {
    type: FETCH_PROJECT_PERMISSIONS,
    projectId,
    showLoading
  };
}

export function showProjectPermissions(id, displayName) {
  return {
    type: SHOW_PROJECT_PERMISSIONS,
    id,
    displayName
  };
}

export function showProjectAdditionalData(id) {
  return {
    type: SHOW_PROJECT_ADDITIONAL_DATA,
    id
  };
}

export function hideProjectPermissions() {
  return {
    type: HIDE_PROJECT_PERMISSIONS
  };
}

export function hideProjectAdditionalData() {
  return {
    type: HIDE_PROJECT_ADDITIONAL_DATA
  };
}

export function showCreationDialog() {
  return {
    type: SHOW_CREATION_DIALOG
  };
}
export function hideProjectDialog() {
  return {
    type: HIDE_PROJECT_DIALOG
  };
}

export function showEditDialog(id, displayName, description, thumbnail, projectedBudgets, tags) {
  return {
    type: SHOW_EDIT_DIALOG,
    id,
    displayName,
    description,
    thumbnail,
    projectedBudgets,
    tags
  };
}

export function storeProjectName(name) {
  return {
    type: PROJECT_NAME,
    name: name
  };
}

export function addProjectProjectedBudget(projectedBudget) {
  return {
    type: ADD_PROJECT_PROJECTED_BUDGET,
    projectedBudget
  };
}

export function editProjectProjectedBudgetAmount(projectedBudget, budgetAmountEdit) {
  return {
    type: EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT,
    projectedBudget,
    budgetAmountEdit
  };
}

export function storeDeletedProjectedBudget(projectedBudgets) {
  return {
    type: PROJECT_DELETED_PROJECTED_BUDGET,
    projectedBudgets: projectedBudgets
  };
}

export function storeProjectComment(comment) {
  return {
    type: PROJECT_COMMENT,
    comment: comment
  };
}

export function storeProjectThumbnail(thumbnail) {
  return {
    type: PROJECT_THUMBNAIL,
    thumbnail: thumbnail
  };
}

export function setCurrentStep(step) {
  return {
    type: PROJECT_CREATION_STEP,
    step
  };
}

export function grantProjectPermission(
  projectId,
  projectDisplayName,
  intent,
  granteeId,
  granteeDisplayName,
  showLoading = false
) {
  return {
    type: GRANT_PROJECT_PERMISSION,
    projectId,
    projectDisplayName,
    intent,
    granteeId,
    granteeDisplayName,
    showLoading
  };
}

export function revokeProjectPermission(
  projectId,
  projectDisplayName,
  intent,
  revokeeId,
  revokeeDisplayName,
  showLoading = false
) {
  return {
    type: REVOKE_PROJECT_PERMISSION,
    projectId,
    projectDisplayName,
    intent,
    revokeeId,
    revokeeDisplayName,
    showLoading
  };
}

export function addProjectTag(tag) {
  return {
    type: ADD_PROJECT_TAG,
    tag
  };
}

export function removeProjectTag(tag) {
  return {
    type: REMOVE_PROJECT_TAG,
    tag
  };
}

export function addCustomImage(imageBase64) {
  return {
    type: ADD_PROJECT_CUSTOM_IMAGE,
    customImage: imageBase64
  };
}

export function removeCustomImage(imageBase64) {
  return {
    type: REMOVE_PROJECT_CUSTOM_IMAGE,
    customImage: imageBase64
  };
}

export function addTemporaryPermission(permission, userId) {
  return {
    type: ADD_TEMPORARY_PROJECT_PERMISSION,
    permission,
    userId
  };
}

export function removeTemporaryPermission(permission, userId) {
  return {
    type: REMOVE_TEMPORARY_PROJECT_PERMISSION,
    permission,
    userId
  };
}

export function storeFilteredProjects(filteredProjects) {
  return {
    type: STORE_FILTERED_PROJECTS,
    filteredProjects
  };
}

export function storeSearchTermArray(searchTerms) {
  return {
    type: STORE_SEARCH_TERMS_AS_ARRAY,
    searchTerms
  };
}
export function setProjectView(projectView) {
  return {
    type: STORE_PROJECT_VIEW,
    projectView
  };
}

export const setPage = (page) => ({
  type: SET_PAGE,
  page
});

export const setRowsPerPage = (limit, page) => ({
  type: SET_ROWS_PER_PAGE,
  limit,
  page
});

export const setSort = (column, direction) => ({
  type: SET_SORT,
  column,
  direction
});
