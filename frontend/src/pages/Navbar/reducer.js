import { fromJS } from "immutable";
import { CREATE_PROJECT_SUCCESS } from "../Overview/actions";
import { FETCH_ALL_PROJECT_DETAILS_SUCCESS } from "../SubProjects/actions";
import { FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS } from "../Workflows/actions";
import {
  FETCH_ACTIVE_PEERS_SUCCESS,
  FETCH_STREAM_NAMES_SUCCESS,
  FETCH_VERSIONS_SUCCESS,
  SEARCH_BAR_DISPLAYED,
  SEARCH_TERM,
  SET_IS_ROOT,
  SET_SELECTED_VIEW,
  TOGGLE_SIDEBAR,
  SHOW_USER_PROFILE,
  HIDE_USER_PROFILE,
  ENABLE_USER_PROFILE_EDIT,
  DISABLE_USER_PROFILE_EDIT,
  STORE_TEMP_EMAIL,
  CHECK_EMAIL_SERVICE_SUCCESS,
  CHECK_EMAIL_SERVICE_FAILURE,
  FETCH_EMAIL_SUCCESS
} from "./actions";
import { convertToURLQuery } from "./convertSearchTerm";

const defaultState = fromJS({
  showSidebar: false,
  numberOfActivePeers: 0,
  unreadNotifications: 0,
  streamNames: {},
  selectedId: "",
  selectedSection: "",
  currentProject: " ",
  currentSubProject: " ",
  versions: null,
  searchTerm: "",
  searchBarDisplayed: false,
  isRoot: false,
  userProfileOpen: false,
  userProfileEdit: false,
  tempEmail: "",
  emailServiceAvailable: false
});

export default function navbarReducer(state = defaultState, action) {
  switch (action.type) {
    case TOGGLE_SIDEBAR:
      return state.set("showSidebar", !state.get("showSidebar"));
    case FETCH_ACTIVE_PEERS_SUCCESS:
      return state.set("numberOfActivePeers", action.activePeers);
    case FETCH_STREAM_NAMES_SUCCESS:
      return state.set("streamNames", fromJS(action.streamNames));
    case SET_SELECTED_VIEW:
      return defaultState.merge({
        selectedId: action.id,
        selectedSection: action.section,
        isRoot: state.get("isRoot")
      });
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      return state.set("currentProject", action.project.data.displayName);
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS:
      return state.merge({
        currentSubProject: action.subproject.data.displayName,
        currentProject: action.parentProject.displayName
      });
    case FETCH_VERSIONS_SUCCESS:
      return state.set("versions", action.versions);
    case SEARCH_TERM:
      const querySearchTerm = convertToURLQuery(action.searchTerm);
      window.history.replaceState("", "Title", "?" + querySearchTerm);
      return state.set("searchTerm", action.searchTerm);
    case SEARCH_BAR_DISPLAYED:
      return state.set("searchBarDisplayed", action.searchBarDisplayed);
    case SET_IS_ROOT:
      return state.set("isRoot", action.isRoot);
    case SHOW_USER_PROFILE:
      return state.set("userProfileOpen", true);
    case HIDE_USER_PROFILE:
      return state.set("userProfileOpen", false);
    case ENABLE_USER_PROFILE_EDIT:
      return state.set("userProfileEdit", true);
    case DISABLE_USER_PROFILE_EDIT:
      return state.set("userProfileEdit", false);
    case FETCH_EMAIL_SUCCESS:
      return state.set("userProfileEdit", false);
    case STORE_TEMP_EMAIL:
      return state.set("tempEmail", action.email);
    case CHECK_EMAIL_SERVICE_SUCCESS:
      return state.set("emailServiceAvailable", true);
    case CHECK_EMAIL_SERVICE_FAILURE:
      return state.set("emailServiceAvailable", false);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        searchTerm: defaultState.get("searchTerm"),
        searchBarDisplayed: defaultState.get("searchBarDisplayed")
      });
    default:
      return state;
  }
}
