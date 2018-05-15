import { fromJS } from "immutable";
import {
  SHOW_SNACKBAR,
  SNACKBAR_MESSAGE,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_HISTORY_SUCCESS,
  OPEN_HISTORY,
  HIDE_HISTORY
} from "./actions";
import { LOGOUT } from "../Login/actions";
import { FETCH_UPDATES_SUCCESS } from "../LiveUpdates/actions";

const defaultState = fromJS({
  list: [],
  showHistory: false,
  showSnackBar: false,
  snackBarMessage: "New Project added",
  snackBarMessageIsError: false,
  historyItems: []
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_UPDATES_SUCCESS:
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set("list", fromJS(action.notifications));
    case SHOW_SNACKBAR:
      return state.merge({
        showSnackBar: action.show,
        snackBarMessageIsError: action.isError
      });
    case SNACKBAR_MESSAGE:
      return state.set("snackBarMessage", action.message);
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
