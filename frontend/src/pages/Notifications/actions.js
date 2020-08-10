export const SHOW_SNACKBAR = "SHOW_SNACKBAR";
export const HIDE_SNACKBAR = "HIDE_SNACKBAR";
export const SNACKBAR_MESSAGE = "SNACKBAR_MESSAGE";

export const MARK_NOTIFICATION_AS_READ = "MARK_NOTIFICATION_AS_READ";
export const MARK_NOTIFICATION_AS_READ_SUCCESS = "MARK_NOTIFICATION_AS_READ_SUCCESS";

export const OPEN_HISTORY = "OPEN_HISTORY";
export const HIDE_HISTORY = "HIDE_HISTORY";

export const ENABLE_LIVE_UPDATES = "ENABLE_LIVE_UPDATES";
export const DISABLE_LIVE_UPDATES = "DISABLE_LIVE_UPDATES";

export const FETCH_HISTORY = "FETCH_HISTORY";
export const FETCH_HISTORY_SUCCESS = "FETCH_HISTORY_SUCCESS";

export const FETCH_ALL_NOTIFICATIONS = "FETCH_ALL_NOTIFICATIONS";
export const FETCH_ALL_NOTIFICATIONS_SUCCESS = "FETCH_ALL_NOTIFICATIONS_SUCCESS";

export const LIVE_UPDATE_NOTIFICATIONS = "LIVE_UPDATE_NOTIFICATIONS";
export const LIVE_UPDATE_NOTIFICATIONS_SUCCESS = "LIVE_UPDATE_NOTIFICATIONS_SUCCESS";

export const MARK_MULTIPLE_NOTIFICATIONS_AS_READ = "MARK_MULTIPLE_NOTIFICATIONS_AS_READ";
export const MARK_MULTIPLE_NOTIFICATIONS_AS_READ_SUCCESS = "MARK_MULTIPLE_NOTIFICATIONS_AS_READ_SUCCESS";

export const FETCH_NOTIFICATION_COUNT = "FETCH_NOTIFICATION_COUNT";
export const FETCH_NOTIFICATION_COUNT_SUCCESS = "FETCH_NOTIFICATION_COUNT_SUCCESS";

export const SET_NOTIFICATIONS_PER_PAGE = "SET_NOTIFICATIONS_PER_PAGE";
export const SET_NOTIFICATION_OFFSET = "SET_NOTIFICATION_OFFSET";

export const TIME_OUT_FLY_IN = "TIME_OUT_FLY_IN";

export function showSnackbar(isError = false, isWarning = false) {
  return {
    type: SHOW_SNACKBAR,
    show: true,
    isError,
    isWarning
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

export function updateNotification(showLoading = false, offset) {
  return {
    type: LIVE_UPDATE_NOTIFICATIONS,
    showLoading,
    offset
  };
}
export function fetchNotifications(showLoading = false, notificationPage) {
  return {
    type: FETCH_ALL_NOTIFICATIONS,
    showLoading,
    notificationPage
  };
}

export function fetchNotificationCounts(showLoading = false) {
  return {
    type: FETCH_NOTIFICATION_COUNT,
    showLoading
  };
}

export function markNotificationAsRead(notificationId, notificationPage) {
  return {
    type: MARK_NOTIFICATION_AS_READ,
    notificationId,
    notificationPage
  };
}

export function openHistory() {
  return {
    type: OPEN_HISTORY
  };
}
export function hideHistory() {
  return {
    type: HIDE_HISTORY
  };
}

export function fetchHistoryItems(project, offset, limit) {
  return {
    type: FETCH_HISTORY,
    project,
    offset,
    limit
  };
}

export function markMultipleNotificationsAsRead(notificationIds, notificationPage) {
  return {
    type: MARK_MULTIPLE_NOTIFICATIONS_AS_READ,
    notificationIds,
    notificationPage
  };
}

export function setNotifcationsPerPage(notificationPageSize) {
  return {
    type: SET_NOTIFICATIONS_PER_PAGE,
    notificationPageSize: notificationPageSize
  };
}

export function enableLiveUpdates() {
  return {
    type: ENABLE_LIVE_UPDATES
  };
}

export function disableLiveUpdates() {
  return {
    type: DISABLE_LIVE_UPDATES
  };
}
