export const SHOW_SNACKBAR = "SHOW_SNACKBAR";
export const HIDE_SNACKBAR = "HIDE_SNACKBAR";
export const SNACKBAR_MESSAGE = "SNACKBAR_MESSAGE";
export const MARK_NOTIFICATION_AS_READ = "MARK_NOTIFICATION_AS_READ";
export const MARK_NOTIFICATION_AS_READ_SUCCESS = "MARK_NOTIFICATION_AS_READ_SUCCESS";
export const OPEN_HISTORY = "OPEN_HISTORY";
export const HIDE_HISTORY = "HIDE_HISTORY";
export const FETCH_HISTORY = "FETCH_HISTORY";
export const FETCH_HISTORY_SUCCESS = "FETCH_HISTORY_SUCCESS";
export const FETCH_NOTIFICATIONS_WITH_ID = "FETCH_NOTIFICATIONS_WITH_ID";
export const FETCH_NOTIFICATIONS_WITH_ID_SUCCESS = "FETCH_NOTIFICATIONS_WITH_ID_SUCCESS";
export const FETCH_ALL_NOTIFICATIONS = "FETCH_ALL_NOTIFICATIONS";
export const FETCH_ALL_NOTIFICATIONS_SUCCESS = "FETCH_ALL_NOTIFICATIONS_SUCCESS";

export function showSnackbar(isError = false) {
  return {
    type: SHOW_SNACKBAR,
    show: true,
    isError
  };
}

export function hideSnackbar() {
  return {
    type: HIDE_SNACKBAR,
    show: false
  };
}

export function storeSnackbarMessage(message) {
  return {
    type: SNACKBAR_MESSAGE,
    message: message
  };
}

export function fetchAllNotifications(showLoading = false) {
  return {
    type: FETCH_ALL_NOTIFICATIONS,
    showLoading
  };
}

export function fetchNotificationsWithId(fromId, showLoading = false) {
  return {
    type: FETCH_NOTIFICATIONS_WITH_ID,
    fromId,
    showLoading
  };
}

export function markNotificationAsRead(notificationId) {
  return {
    type: MARK_NOTIFICATION_AS_READ,
    notificationId
  };
}

export function showHistory() {
  return {
    type: OPEN_HISTORY
  };
}
export function hideHistory() {
  return {
    type: HIDE_HISTORY
  };
}

export function fetchHistoryItems(project) {
  return {
    type: FETCH_HISTORY,
    project
  };
}
