export const FETCH_USERS = 'FETCH_USERS';
export const FETCH_USERS_SUCCESS = 'FETCH_USERS_SUCCESS';
export const LOGIN = 'LOGIN';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

export function fetchUsers() {
  return {
    type: FETCH_USERS
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
