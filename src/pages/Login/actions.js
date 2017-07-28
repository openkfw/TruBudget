export const FETCH_USERS = 'FETCH_USERS';
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const FETCH_ROLES = 'FETCH_ROLES';
export const FETCH_ROLES_SUCCESS = 'FETCH_ROLES_SUCCESS';

export const STORE_USERNAME = 'STORE_USTORE_USERNAMESER';
export const STORE_PASSWORD = 'STORE_PASSWORD';


export function fetchUsers() {
  return {
    type: FETCH_USERS
  }
}

export function fetchRoles() {
  return {
    type: FETCH_ROLES
  }
}

export function loginWithCredentails(username, password) {
  const user = { username, password }
  return {
    type: LOGIN,
    user
  }
}

export function storeUsername(username) {
  return {
    type: STORE_USERNAME,
    username
  }
}
export function storePassword(password) {
  return {
    type: STORE_PASSWORD,
    password
  }
}


export function login(user) {
  return {
    type: LOGIN,
    user
  }
}

export function logout() {
  return {
    type: LOGOUT
  }
}
