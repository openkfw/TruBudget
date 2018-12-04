import { fromJS } from "immutable";
import {
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  FETCH_HISTORY_SUCCESS,
  OPEN_HISTORY,
  HIDE_HISTORY,
  FETCH_ALL_NOTIFICATIONS_SUCCESS,
  HIDE_SNACKBAR,
  FETCH_NOTIFICATION_COUNT_SUCCESS,
  SET_NOTIFICATIONS_PER_PAGE,
  SET_NOTIFICATION_PAGE,
  SET_LAST_FETCHED_BEFORE_ID,
  SET_LAST_FETCHED_AFTER_ID
} from "./actions";
import { LOGOUT } from "../Login/actions";

const defaultState = fromJS({
  notifications: [],
  newNotifications: [],
  showHistory: false,
  showSnackbar: false,
  snackbarMessage: "New Project added",
  snackbarError: false,
  historyItems: [],
  notificationCount: 0,
  notificationsPerPage: 20,
  notificationPage: 0,
  lastFetchedBeforeId: "",
  lastFetchedAfterId: ""
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_NOTIFICATIONS_SUCCESS:
      const oldNotifications = state.get("notifications").toJS();
      let newNotifications = [];
      if (oldNotifications.length > 0) {
        newNotifications = action.notifications.filter(notification => {
          const index = oldNotifications.findIndex(oldNotification => {
            return oldNotification.notificationId === notification.notificationId;
          });
          if (index === -1) {
            return notification;
          }
        });
      }
      return state.merge({
        notifications: fromJS(action.notifications),
        newNotifications: fromJS(newNotifications)
      });
    case FETCH_NOTIFICATION_COUNT_SUCCESS:
      return state.set("notificationCount", action.count);
    case SHOW_SNACKBAR:
      return state.merge({
        showSnackbar: action.show,
        snackbarError: action.isError
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
      return state.set("notificationsPerPage", action.limit);
    case SET_NOTIFICATION_PAGE:
      return state.set("notificationPage", action.page);
    case SET_LAST_FETCHED_BEFORE_ID:
      return state.merge({ lastFetchedBeforeId: action.id, lastFetchedAfterId: "" });
    case SET_LAST_FETCHED_AFTER_ID:
      return state.merge({ lastFetchedAfterId: action.id, lastFetchedBeforeId: "" });
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
