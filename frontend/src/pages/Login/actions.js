export const LOGIN = "LOGIN";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";

export const FETCH_USER = "FETCH_USER";
export const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";

export const STORE_USERNAME = "STORE_USERNAME";
export const STORE_PASSWORD = "STORE_PASSWORD";
export const LOGIN_ERROR_MESSAGE = "LOGIN_ERROR_MESSAGE";
export const SHOW_LOGIN_ERROR = "SHOW_LOGIN_ERROR";
export const STORE_ENVIRONMENT = "STORE_ENVIRONMENT";
export const STORE_ENVIRONMENT_SUCCESS = "STORE_ENVIRONMENT_SUCCESS";
export const FETCH_ENVIRONMENT = "FETCH_ENVIRONMENT";
export const FETCH_ENVIRONMENT_SUCCESS = "FETCH_ENVIRONMENT_SUCCESS";

export const INIT_LANGUAGE = "INIT_LANGUAGE";
export const SET_LANGUAGE = "SET_LANGUAGE";

export const ADMIN_LOGIN = "ADMIN_LOGIN";
export const ADMIN_LOGIN_SUCCESS = "ADMIN_LOGIN_SUCCESS";
export const ADMIN_LOGOUT = "ADMIN_LOGOUT";
export const ADMIN_LOGOUT_SUCCESS = "ADMIN_LOGOUT_SUCCESS";
export const FETCH_ADMIN_USER = "FETCH_ADMIN_USER";
export const FETCH_ADMIN_USER_SUCCESS = "FETCH_ADMIN_USER_SUCCESS";
export const SHOW_ADMIN_LOGIN_ERROR = "SHOW_ADMIN_LOGIN_ERROR";

export const FETCH_EMAIL_ADDRESS = "FETCH_EMAIL_ADDRESS";
export const FETCH_EMAIL_ADDRESS_SUCCESS = "FETCH_EMAIL_ADDRESS_SUCCESS";
export const FETCH_EMAIL_ADDRESS_FAILURE = "FETCH_EMAIL_ADDRESS_FAILURE";
export const CHECK_EMAIL_SERVICE = "CHECK_EMAIL_SERVICE";
export const CHECK_EMAIL_SERVICE_SUCCESS = "CHECK_EMAIL_SERVICE_SUCCESS";
export const CHECK_EMAIL_SERVICE_FAILURE = "CHECK_EMAIL_SERVICE_FAILURE";

export function fetchUser(showLoading = false) {
  return {
    type: FETCH_USER,
    showLoading
  };
}

export function loginWithCredentials(username, password) {
  const user = { username, password };
  return {
    type: LOGIN,
    user
  };
}

export function storeUsername(username) {
  return {
    type: STORE_USERNAME,
    username
  };
}
export function storePassword(password) {
  return {
    type: STORE_PASSWORD,
    password
  };
}

export function login(user) {
  return {
    type: LOGIN,
    user
  };
}

export function logout() {
  return {
    type: LOGOUT
  };
}

export function loginAdmin(user) {
  return {
    type: ADMIN_LOGIN,
    user
  };
}

export function logoutAdmin() {
  return {
    type: ADMIN_LOGOUT
  };
}
export function showAdminLoginError(show) {
  return {
    type: SHOW_ADMIN_LOGIN_ERROR,
    show
  };
}

export function storeLoginErrorMessage(message) {
  return {
    type: LOGIN_ERROR_MESSAGE,
    message
  };
}

export function showLoginError(show) {
  return {
    type: SHOW_LOGIN_ERROR,
    show
  };
}

export function storeEnvironment(environment) {
  const active = environment === "Prod" ? true : false;
  return {
    type: STORE_ENVIRONMENT,
    environment,
    active
  };
}

export function getEnvironment() {
  return {
    type: FETCH_ENVIRONMENT
  };
}

export function initLanguage() {
  return {
    type: INIT_LANGUAGE
  };
}

export function setLanguage(language) {
  return {
    type: SET_LANGUAGE,
    language
  };
}

export function fetchEmailAddress() {
  return {
    type: FETCH_EMAIL_ADDRESS
  };
}

export function checkEmailService() {
  return {
    type: CHECK_EMAIL_SERVICE
  };
}
