import { fromJS } from "immutable";
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
  TOGGLE_SIDEBAR
} from "./actions";

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
  isRoot: false
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
      return state.merge({
        selectedId: action.id,
        selectedSection: action.section
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
      return state.set("searchTerm", action.searchTerm);
    case SEARCH_BAR_DISPLAYED:
      return state.set("searchBarDisplayed", action.searchBarDisplayed);
    case SET_IS_ROOT:
      return state.set("isRoot", action.isRoot);
    default:
      return state;
  }
}
