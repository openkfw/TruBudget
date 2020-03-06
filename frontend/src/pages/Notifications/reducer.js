import { fromJS } from "immutable";
import {
  DISABLE_LIVE_UPDATES,
  ENABLE_LIVE_UPDATES,
  FETCH_ALL_NOTIFICATIONS_SUCCESS,
  FETCH_HISTORY_SUCCESS,
  FETCH_NOTIFICATION_COUNT_SUCCESS,
  HIDE_HISTORY,
  HIDE_SNACKBAR,
  LIVE_UPDATE_NOTIFICATIONS_SUCCESS,
  OPEN_HISTORY,
  SET_NOTIFICATIONS_PER_PAGE,
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  TIME_OUT_FLY_IN
} from "./actions";

const defaultState = fromJS({
  notifications: [],
  newNotifications: [],
  showHistory: false,
  showSnackbar: false,
  snackbarMessage: "New Project added",
  snackbarError: false,
  snackbarWarning: false,
  historyItems: [],
  unreadNotificationCount: 0,
  notificationsPerPage: 20,
  notificationOffset: 0,
  isLiveUpdatesEnabled: true,
  totalNotificationCount: 0,
  currentNotificationPage: 1,
  notificationPageSize: 20
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_NOTIFICATIONS_SUCCESS:
      return state.merge({
        notifications: fromJS(action.notifications),
        currentNotificationPage: action.currentNotificationPage,
        totalNotificationCount: action.totalNotificationCount
      });

    case ENABLE_LIVE_UPDATES: {
      return state.set("isLiveUpdatesEnabled", true);
    }

    case DISABLE_LIVE_UPDATES: {
      return state.set("isLiveUpdatesEnabled", false);
    }

    case LIVE_UPDATE_NOTIFICATIONS_SUCCESS: {
      const { newNotifications } = action;
      const count = newNotifications.length;
      const notificationCount =
        count > 0 ? state.get("notificationCount") + newNotifications.length : state.get("notificationCount");
      const unreadNotificationCount = state.get("unreadNotificationCount") + count;
      return state.merge({
        newNotifications: fromJS(newNotifications),
        notificationCount: notificationCount,
        unreadNotificationCount
      });
    }
    case TIME_OUT_FLY_IN: {
      return state.set("newNotifications", defaultState.get("newNotifications"));
    }
    case FETCH_NOTIFICATION_COUNT_SUCCESS:
      return state.merge({
        unreadNotificationCount: action.unreadNotificationCount,
        notificationCount: action.notificationCount
      });
    case SHOW_SNACKBAR:
      return state.merge({
        showSnackbar: action.show,
        snackbarError: action.isError,
        snackbarWarning: action.isWarning
      });
    case HIDE_SNACKBAR:
      return state.set("showSnackbar", action.show);
    case SNACKBAR_MESSAGE:
      return state.set("snackbarMessage", action.message);
    case FETCH_HISTORY_SUCCESS:
      return state.set("historyItems", fromJS(action.historyItems));
    case OPEN_HISTORY:
      return state.set("showHistory", true);
    case HIDE_HISTORY:
      return state.set("showHistory", false);
    case SET_NOTIFICATIONS_PER_PAGE:
      return state.set("notificationPageSize", action.notificationPageSize);
    default:
      return state;
  }
}
