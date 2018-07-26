export const SET_DISPLAYNAME = "SET_DISPLAYNAME";
export const SET_ORGANIZATION = "SET_ORGANIZATION";
export const SET_USERNAME = "SET_USERNAME";
export const SET_PASSWORD = "SET_PASSWORD";

export const CREATE_USER = "CREATE_USER";
export const CREATE_USER_SUCCESS = "CREATE_USER_SUCCESS";

export const RESET_USER = "RESET_USER";

export const TAB_INDEX = "TAB_INDEX";
export const SHOW_DASHBOARD_DIALOG = "SHOW_DASHBOARD_DIALOG";
export const HIDE_DASHBOARD_DIALOG = "HIDE_DASHBOARD_DIALOG";

export function resetUserToAdd() {
  return {
    type: RESET_USER
  };
}
export function setDisplayName(displayName) {
  return {
    type: SET_DISPLAYNAME,
    displayName
  };
}
export function setOrganization(organization) {
  return {
    type: SET_ORGANIZATION,
    organization
  };
}

export function setUsername(username) {
  return {
    type: SET_USERNAME,
    username
  };
}

export function setPassword(password) {
  return {
    type: SET_PASSWORD,
    password
  };
}
export function setTabIndex(value) {
  return {
    type: TAB_INDEX,
    value
  };
}

export function createUser(displayName, organization, username, password) {
  return {
    type: CREATE_USER,
    displayName,
    organization,
    username,
    password
  };
}

export function showDashboardDialog(dialogType, editId = null) {
  return {
    type: SHOW_DASHBOARD_DIALOG,
    dialogType,
    editId
  };
}

export function hideDashboardDialog() {
  return {
    type: HIDE_DASHBOARD_DIALOG
  };
}
