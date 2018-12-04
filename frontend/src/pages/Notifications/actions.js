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

export const SET_NOTIFICATION_PAGE = "SET_NOTIFICATION_PAGE";

export const SET_LAST_FETCHED_BEFORE_ID = "SET_LAST_FETCHED_BEFORE_ID";
export const SET_LAST_FETCHED_AFTER_ID = "SET_LAST_FETCHED_AFTER_ID";

export const IS_NOTIFICATION_PAGE_SHOWN = "IS_NOTIFICATION_PAGE_SHOWN";

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
export function fetchNotifications(showLoading = false, beforeId, afterId, limit) {
  return {
    type: FETCH_ALL_NOTIFICATIONS,
    showLoading,
    beforeId,
    afterId,
    limit
  };
}

export function fetchNotificationCount(showLoading = false) {
  return {
    type: FETCH_NOTIFICATION_COUNT,
    showLoading
  };
}

export function markNotificationAsRead(notificationId, beforeId, afterId, limit) {
  return {
    type: MARK_NOTIFICATION_AS_READ,
    notificationId,
    beforeId,
    afterId,
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

export function markAllNotificationAsRead(notificationIds, beforeId, afterId, limit) {
  return {
    type: MARK_ALL_NOTIFICATION_AS_READ,
    notificationIds,
    beforeId,
    afterId,
    limit
  };
}

export function setNotifcationsPerPage(limit) {
  return {
    type: SET_NOTIFICATIONS_PER_PAGE,
    limit
  };
}

export function setNotificationPage(page) {
  return {
    type: SET_NOTIFICATION_PAGE,
    page
  };
}

export function setLastFetchedBeforeId(id) {
  return {
    type: SET_LAST_FETCHED_BEFORE_ID,
    id
  };
}

export function setLastFetchedAfterId(id) {
  return {
    type: SET_LAST_FETCHED_AFTER_ID,
    id
  };
}

export function isNotificationPageShown(show) {
  return {
    type: IS_NOTIFICATION_PAGE_SHOWN,
    show
  };
}
