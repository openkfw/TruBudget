export const SET_DISPLAYNAME = "SET_DISPLAYNAME";
export const SET_ORGANIZATION = "SET_ORGANIZATION";
export const SET_USERNAME = "SET_USERNAME";
export const SET_PASSWORD = "SET_PASSWORD";

export const SET_ADMIN_PERMISSIONS = "SET_ADMIN_PERMISSIONS";

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

export const GRANT_ALL_USER_PERMISSIONS = "GRANT_ALL_USER_PERMISSIONS";
export const GRANT_ALL_USER_PERMISSIONS_SUCCESS = "GRANT_ALL_USER_PERMISSIONS_SUCCESS";


export const GRANT_GLOBAL_PERMISSION= "GRANT_GLOBAL_PERMISSION";
export const GRANT_GLOBAL_PERMISSION_SUCCESS= "GRANT_GLOBAL_PERMISSION_SUCCESS";


export const REVOKE_GLOBAL_PERMISSION= "REVOKE_GLOBAL_PERMISSION";
export const REVOKE_GLOBAL_PERMISSION_SUCCESS= "REVOKE_GLOBAL_PERMISSION_SUCCESS";

export const LIST_GLOBAL_PERMISSIONS = "LIST_GLOBAL_PERMISSIONS"
export const LIST_GLOBAL_PERMISSIONS_SUCCESS = "LIST_GLOBAL_PERMISSIONS_SUCCESS"

export const EXPAND_PERMISSION_PANEL = "EXPAND_PERMISSION_PANEL";

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

export function setAdminPermissions(hasAdminPermissions) {
  return {
    type: SET_ADMIN_PERMISSIONS,
    hasAdminPermissions
  };
}

export function setTabIndex(value) {
  return {
    type: TAB_INDEX,
    value
  };
}

export function grantAllUserPermissions(userId) {
  return {
    type: GRANT_ALL_USER_PERMISSIONS,
    userId
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

export function grantGlobalPermission(userId, intent){
  return {
    type: GRANT_GLOBAL_PERMISSION,
    userId,
    intent
  }
}

export function revokeGlobalPermission(userId, intent){
  return {
    type: REVOKE_GLOBAL_PERMISSION,
    userId,
    intent
  }
}

export function listPermissions(){
  return {
    type: LIST_GLOBAL_PERMISSIONS
  }
}

export function expandPermissionsPanel(expanded){
  return {
    type: EXPAND_PERMISSION_PANEL,
    expanded
  }
}
