export const LOGIN = "LOGIN";
export const LOGIN_AD = "LOGIN_AD";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGOUT = "LOGOUT";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const LOGIN_ERROR = "LOGIN_ERROR";
export const LOGIN_LOADING = "LOGIN_LOADING";

export const FETCH_USER = "FETCH_USER";
export const FETCH_USER_SUCCESS = "FETCH_USER_SUCCESS";

export const STORE_USERNAME = "STORE_USERNAME";
export const STORE_PASSWORD = "STORE_PASSWORD";
export const STORE_EMAIL = "STORE_EMAIL";

export const INIT_LANGUAGE = "INIT_LANGUAGE";
export const SET_LANGUAGE = "SET_LANGUAGE";

export const ADMIN_LOGIN = "ADMIN_LOGIN";
export const ADMIN_LOGIN_SUCCESS = "ADMIN_LOGIN_SUCCESS";
export const ADMIN_LOGOUT = "ADMIN_LOGOUT";
export const ADMIN_LOGOUT_SUCCESS = "ADMIN_LOGOUT_SUCCESS";
export const FETCH_ADMIN_USER = "FETCH_ADMIN_USER";
export const FETCH_ADMIN_USER_SUCCESS = "FETCH_ADMIN_USER_SUCCESS";

export const FETCH_EMAIL_ADDRESS = "FETCH_EMAIL_ADDRESS";
export const FETCH_EMAIL_ADDRESS_SUCCESS = "FETCH_EMAIL_ADDRESS_SUCCESS";
export const FETCH_EMAIL_ADDRESS_FAILURE = "FETCH_EMAIL_ADDRESS_FAILURE";
export const CHECK_EMAIL_SERVICE = "CHECK_EMAIL_SERVICE";
export const CHECK_EMAIL_SERVICE_SUCCESS = "CHECK_EMAIL_SERVICE_SUCCESS";
export const CHECK_EMAIL_SERVICE_FAILURE = "CHECK_EMAIL_SERVICE_FAILURE";

export const CHECK_EXPORT_SERVICE = "CHECK_EXPORT_SERVICE";
export const CHECK_EXPORT_SERVICE_SUCCESS = "CHECK_EXPORT_SERVICE_SUCCESS";
export const CHECK_EXPORT_SERVICE_FAILURE = "CHECK_EXPORT_SERVICE_FAILURE";

export const SEND_FORGOT_PASSWORD_EMAIL = "SEND_FORGOT_PASSWORD_EMAIL";
export const RESET_USER_PASSWORD = "RESET_USER_PASSWORD";

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

export function loginWithToken(token) {
  return {
    type: LOGIN_AD,
    token
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

export function loginLoading(showLoading) {
  return {
    type: LOGIN_LOADING,
    showLoading
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

export function checkEmailService(showLoading) {
  return {
    type: CHECK_EMAIL_SERVICE,
    showLoading
  };
}

export function checkExportService(showLoading) {
  return {
    type: CHECK_EXPORT_SERVICE,
    showLoading
  };
}

export function storeEmail(email) {
  return {
    type: STORE_EMAIL,
    email
  };
}

export function sendForgotPasswordEmail(email, url, lang) {
  const data = { email, url, lang };
  return {
    type: SEND_FORGOT_PASSWORD_EMAIL,
    data
  };
}

export function resetUserPassword(username, newPassword, token) {
  return {
    type: RESET_USER_PASSWORD,
    username,
    newPassword,
    token
  };
}
