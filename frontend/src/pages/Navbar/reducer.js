import { fromJS } from "immutable";

import { TOGGLE_SIDEBAR, FETCH_PEERS_SUCCESS, FETCH_STREAM_NAMES_SUCCESS, SET_SELECTED_VIEW } from "./actions";
import { FETCH_NOTIFICATIONS_SUCCESS } from "../Notifications/actions";
import { FETCH_UPDATES_SUCCESS } from "../LiveUpdates/actions";
import { LOGOUT } from "../Login/actions";
import { FETCH_ALL_PROJECT_DETAILS_SUCCESS } from "../SubProjects/actions";
import { FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS } from "../Workflows/actions";

const defaultState = fromJS({
  showSidebar: false,
  peers: [],
  unreadNotifications: 0,
  streamNames: {},
  selectedId: "",
  selectedSection: "",
  currentProject: " ",
  currentSubProject: " "
});

const countUnreadNotifications = notifications =>
  notifications.reduce((acc, notification) => {
    return notification.isRead === false ? acc + 1 : acc;
  }, 0);

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return state.set("showSidebar", !state.get("showSidebar"));
    case FETCH_PEERS_SUCCESS:
      return state.merge({
        peers: action.peers
      });
    case FETCH_NOTIFICATIONS_SUCCESS:
      return state.set("unreadNotifications", countUnreadNotifications(action.notifications));
    case FETCH_STREAM_NAMES_SUCCESS:
      return state.set("streamNames", fromJS(action.streamNames));
    case SET_SELECTED_VIEW:
      return state.merge({
        selectedId: action.id,
        selectedSection: action.section
      });
    case FETCH_UPDATES_SUCCESS:
      return state.merge({
        peers: action.peers,
        unreadNotifications: countUnreadNotifications(action.notifications),
        streamNames: action.streamNames
      });
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      return state.set("currentProject", action.project.data.displayName);
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS:
      return state.merge({
        currentSubProject: action.subproject.data.displayName,
        currentProject: action.parentProject.displayName
      });
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
