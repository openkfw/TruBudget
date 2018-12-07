export const SHOW_SNACKBAR = "SHOW_SNACKBAR";
export const HIDE_SNACKBAR = "HIDE_SNACKBAR";
export const SNACKBAR_MESSAGE = "SNACKBAR_MESSAGE";

export const MARK_NOTIFICATION_AS_READ = "MARK_NOTIFICATION_AS_READ";
export const MARK_NOTIFICATION_AS_READ_SUCCESS = "MARK_NOTIFICATION_AS_READ_SUCCESS";

export const OPEN_HISTORY = "OPEN_HISTORY";
export const HIDE_HISTORY = "HIDE_HISTORY";

export const FETCH_HISTORY = "FETCH_HISTORY";
export const FETCH_HISTORY_SUCCESS = "FETCH_HISTORY_SUCCESS";

export const FETCH_ALL_NOTIFICATIONS = "FETCH_ALL_NOTIFICATIONS";
export const FETCH_ALL_NOTIFICATIONS_SUCCESS = "FETCH_ALL_NOTIFICATIONS_SUCCESS";

export const FETCH_FLYIN_NOTIFICATIONS = "FETCH_FLYIN_NOTIFICATIONS";
export const FETCH_FLYIN_NOTIFICATIONS_SUCCESS = "FETCH_FLYIN_NOTIFICATIONS_SUCCESS";

export const MARK_ALL_NOTIFICATION_AS_READ = "MARK_ALL_NOTIFICATION_AS_READ";
export const MARK_ALL_NOTIFICATION_AS_READ_SUCCESS = "MARK_ALL_NOTIFICATION_AS_READ_SUCCESS";

export const FETCH_NOTIFICATION_COUNT = "FETCH_NOTIFICATION_COUNT";
export const FETCH_NOTIFICATION_COUNT_SUCCESS = "FETCH_NOTIFICATION_COUNT_SUCCESS";

export const SET_NOTIFICATIONS_PER_PAGE = "SET_NOTIFICATIONS_PER_PAGE";
export const SET_NOTIFICATION_OFFSET = "SET_NOTIFICATION_OFFSET";

export const TIME_OUT_FLY_IN = "TIME_OUT_FLY_IN";

export const FETCH_LATEST_NOTIFICATION = "FETCH_LATEST_NOTIFICATION";
export const FETCH_LATEST_NOTIFICATION_SUCCESS = "FETCH_LATEST_NOTIFICATION_SUCCESS";

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

export function fetchFlyInNotifications(showLoading = false, beforeId) {
  return {
    type: FETCH_FLYIN_NOTIFICATIONS,
    beforeId,
    showLoading
  };
}
export function fetchNotifications(showLoading = false, offset, limit) {
  return {
    type: FETCH_ALL_NOTIFICATIONS,
    showLoading,
    offset,
    limit
  };
}

export function fetchLatestNotification(showLoading = false) {
  return {
    type: FETCH_LATEST_NOTIFICATION,
    showLoading,
  };
}


export function fetchNotificationCount(showLoading = false) {
  return {
    type: FETCH_NOTIFICATION_COUNT,
    showLoading
  };
}

export function markNotificationAsRead(notificationId, offset, limit) {
  return {
    type: MARK_NOTIFICATION_AS_READ,
    notificationId,
    offset,
    limit
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

export function markAllNotificationAsRead(notificationIds, offset, limit) {
  return {
    type: MARK_ALL_NOTIFICATION_AS_READ,
    notificationIds,
    offset,
    limit
  };
}

export function setNotifcationsPerPage(limit) {
  return {
    type: SET_NOTIFICATIONS_PER_PAGE,
    limit
  };
}


export function setNotificationOffset(offset) {
  return {
    type: SET_NOTIFICATION_OFFSET,
    offset
  };
}



