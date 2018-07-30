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

export const FETCH_GROUPS = "FETCH_GROUPS";
export const FETCH_GROUPS_SUCCESS = "FETCH_GROUPS_SUCCESS";

export const GROUP_ID = "GROUP_ID";
export const GROUP_NAME = "GROUP_NAME";

export const ADD_INITIAL_USER = "ADD_INITIAL_USER";
export const REMOVE_INITIAL_USER = "REMOVE_INITIAL_USER";

export const CREATE_GROUP = "CREATE_GROUP";
export const CREATE_GROUP_SUCCESS = "CREATE_GROUP_SUCCESS";

export const ADD_USER = "ADD_USER";
export const ADD_USER_SUCCESS = "ADD_USER_SUCCESS";

export const REMOVE_USER = "REMOVE_USER";
export const REMOVE_USER_SUCCESS = "REMOVE_USER_SUCCESS";

export const SHOW_EDIT_DIALOG = "SHOW_GROUP_EDIT_DIALOG";
export const HIDE_EDIT_DIALOG = "HIDE_GROUP_EDIT_DIALOG";

export function fetchGroups(showLoading = false) {
  return {
    type: FETCH_GROUPS,
    showLoading
  };
}

export function storeGroupId(groupId) {
  return {
    type: GROUP_ID,
    groupId
  };
}

export function storeGroupName(name) {
  return {
    type: GROUP_NAME,
    name
  };
}

export function addInitialUserToGroup(userId) {
  return {
    type: ADD_INITIAL_USER,
    userId
  };
}

export function removeInitialUserFromGroup(userId) {
  return {
    type: REMOVE_INITIAL_USER,
    userId
  };
}

export function createUserGroup(groupId, name, users) {
  return {
    type: CREATE_GROUP,
    groupId,
    name,
    users
  };
}

export function addUser(groupId, userId) {
  return {
    type: ADD_USER,
    groupId,
    userId
  };
}

export function removeUser(groupId, userId) {
  return {
    type: REMOVE_USER,
    groupId,
    userId
  };
}

export function showEditDialog(groupId) {
  return {
    type: SHOW_EDIT_DIALOG,
    groupId
  };
}

export function hideEditDialog() {
  return {
    type: HIDE_EDIT_DIALOG
  };
}

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
