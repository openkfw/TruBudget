export const FETCH_PROJECTS = "FETCH_PROJECTS";
export const FETCH_PROJECTS_SUCCESS = "FETCH_PROJECTS_SUCCESS";

export const CREATE_PROJECT = "CREATE_PROJECT";
export const CREATE_PROJECT_SUCCESS = "CREATE_PROJECT_SUCCESS";

export const FETCH_ALL_PROJECTS = "FETCH_ALL_PROJECTS";
export const FETCH_ALL_PROJECTS_SUCCESS = "FETCH_ALL_PROJECTS_SUCCESS";

export const SHOW_CREATION_DIALOG = "SHOW_CREATION_DIALOG";
export const HIDE_CREATION_DIALOG = "HIDE_CREATION_DIALOG";

export const SHOW_EDIT_DIALOG = "SHOW_EDIT_DIALOG";
export const HIDE_EDIT_DIALOG = "HIDE_EDIT_DIALOG";

export const PROJECT_NAME = "PROJECT_NAME";
export const PROJECT_AMOUNT = "PROJECT_AMOUNT";
export const PROJECT_COMMENT = "PROJECT_COMMENT";
export const PROJECT_CURRENCY = "PROJECT_CURRENCY";
export const PROJECT_THUMBNAIL = "PROJECT_THUMBNAIL";
export const PROJECT_CREATION_STEP = "PROJECT_CREATION_STEP";

export const EDIT_PROJECT = "EDIT_PROJECT";
export const EDIT_PROJECT_SUCCESS = "EDIT_PROJECT_SUCCESS";

export function fetchAllProjects(showLoading = false) {
  return {
    type: FETCH_ALL_PROJECTS,
    showLoading
  };
}

export function createProject(name, amount, comment, currency, thumbnail) {
  return {
    type: CREATE_PROJECT,
    name,
    amount,
    comment,
    currency,
    thumbnail
  };
}

export function editProject(projectId, changes) {
  return {
    type: EDIT_PROJECT,
    projectId,
    changes
  };
}

export function showCreationDialog() {
  return {
    type: SHOW_CREATION_DIALOG
  };
}
export function hideCreationDialog() {
  return {
    type: HIDE_CREATION_DIALOG
  };
}

export function showEditDialog(id, displayName, amount, currency, description, thumbnail) {
  return {
    type: SHOW_EDIT_DIALOG,
    id,
    displayName,
    amount,
    currency,
    description,
    thumbnail
  };
}
export function hideEditDialog() {
  return {
    type: HIDE_EDIT_DIALOG
  };
}

export function storeProjectName(name) {
  return {
    type: PROJECT_NAME,
    name: name
  };
}

export function storeProjectAmount(amount) {
  return {
    type: PROJECT_AMOUNT,
    amount: amount
  };
}

export function storeProjectCurrency(currency) {
  return {
    type: PROJECT_CURRENCY,
    currency: currency
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
