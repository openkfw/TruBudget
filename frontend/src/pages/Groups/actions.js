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

export const SHOW_EDIT_DIALOG = "SHOW_EDIT_DIALOG";
export const HIDE_EDIT_DIALOG = "HIDE_EDIT_DIALOG";

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
