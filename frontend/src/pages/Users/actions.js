export const SWITCH_TABS = "SWITCH_TABS";

export const SET_DISPLAYNAME = "SET_DISPLAYNAME";
export const SET_ORGANIZATION = "SET_ORGANIZATION";
export const SET_USERNAME = "SET_USERNAME";
export const SET_PASSWORD = "SET_PASSWORD";

export const CREATE_USER = "CREATE_USER";
export const CREATE_USER_SUCCESS = "CREATE_USER_SUCCESS";

export const FETCH_NODES = "FETCH_NODES";
export const FETCH_NODES_SUCCESS = "FETCH_NODES_SUCCESS";

export function switchTabs(index) {
  return {
    type: SWITCH_TABS,
    index
  };
}

export function fetchNodes(showLoading = false) {
  return {
    type: FETCH_NODES,
    showLoading
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

export function createUser(displayName, organization, username, password) {
  return {
    type: CREATE_USER,
    displayName,
    organization,
    username,
    password
  };
}
