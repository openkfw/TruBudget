import { fromJS } from "immutable";
import {
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  FETCH_HISTORY_SUCCESS,
  OPEN_HISTORY,
  HIDE_HISTORY,
  FETCH_NOTIFICATIONS_WITH_ID_SUCCESS,
  FETCH_ALL_NOTIFICATIONS_SUCCESS
} from "./actions";
import { LOGOUT } from "../Login/actions";

const defaultState = fromJS({
  notifications: [],
  newNotifications: [],
  showHistory: false,
  showSnackbar: false,
  snackbarMessage: "New Project added",
  snackbarError: false,
  historyItems: []
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_NOTIFICATIONS_SUCCESS:
      return state.merge({
        notifications: fromJS(action.notifications),
        newNotifications: fromJS([])
      });
    case FETCH_NOTIFICATIONS_WITH_ID_SUCCESS:
      return state.merge({
        notifications: fromJS(action.notifications).concat(state.get("notifications")),
        newNotifications: fromJS(action.notifications)
      });
    case SHOW_SNACKBAR:
      return state.merge({
        showSnackbar: action.show,
        snackbarError: action.isError
      });
    case SNACKBAR_MESSAGE:
      return state.set("snackbarMessage", action.message);
    case FETCH_HISTORY_SUCCESS:
      return state.set("historyItems", fromJS(action.historyItems));
    case OPEN_HISTORY:
      return state.set("showHistory", true);
    case HIDE_HISTORY:
      return state.set("showHistory", false);
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
