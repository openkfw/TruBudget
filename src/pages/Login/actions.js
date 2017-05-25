export const FETCH_USERS = 'FETCH_USERS';
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const FETCH_ROLES = 'FETCH_ROLES';
export const FETCH_ROLES_SUCCESS = 'FETCH_ROLES_SUCCESS';

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
