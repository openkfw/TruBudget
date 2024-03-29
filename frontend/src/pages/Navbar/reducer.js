import { fromJS } from "immutable";

import { convertToURLQuery } from "../../helper";
import { FETCH_EMAIL_ADDRESS_SUCCESS } from "../Login/actions";
import { CREATE_PROJECT_SUCCESS } from "../Overview/actions";
import {
  FETCH_ALL_PROJECT_DETAILS_NOT_CURRENT_PROJECT_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS
} from "../SubProjects/actions";
import { FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS } from "../Workflows/actions";

import {
  DISABLE_USER_PROFILE_EDIT,
  ENABLE_USER_PROFILE_EDIT,
  FETCH_ACTIVE_PEERS_SUCCESS,
  FETCH_STREAM_NAMES_SUCCESS,
  HIDE_USER_PROFILE,
  SEARCH_BAR_DISPLAYED,
  SEARCH_TERM,
  SET_IS_ROOT,
  SET_SELECTED_VIEW,
  SET_VALID_EMAIL_ADDRESS_INPUT,
  SHOW_USER_PROFILE,
  STORE_TEMP_EMAIL_ADDRESS,
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
  searchTerm: "",
  searchBarDisplayed: false,
  isRoot: false,
  userProfileOpen: false,
  userProfileEdit: false,
  tempEmailAddress: "",
  isEmailAddressInputValid: true
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
        selectedSection: action.section,
        showSidebar: false,
        searchTerm: defaultState.get("searchTerm"),
        searchBarDisplayed: defaultState.get("searchBarDisplayed"),
        userProfileOpen: defaultState.get("userProfileOpen"),
        userProfileEdit: defaultState.get("userProfileEdit"),
        tempEmailAddress: defaultState.get("tempEmailAddress"),
        isEmailAddressInputValid: defaultState.get("isEmailAddressInputValid")
      });
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      return state.set("currentProject", action.project.data.displayName);
    case FETCH_ALL_PROJECT_DETAILS_NOT_CURRENT_PROJECT_SUCCESS:
      return state.set("loadedProjectDetails", { subprojects: action.subprojects, project: action.project.data });
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS:
      return state.merge({
        currentSubProject: action.subproject.data.displayName,
        currentProject: action.parentProject.displayName
      });
    case SEARCH_TERM: {
      const querySearchTerm = convertToURLQuery(action.searchTerm);
      window.history.replaceState("", "Title", "?" + querySearchTerm);
      return state.set("searchTerm", action.searchTerm);
    }
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
    case FETCH_EMAIL_ADDRESS_SUCCESS:
      return state.set("userProfileEdit", false);
    case STORE_TEMP_EMAIL_ADDRESS:
      return state.set("tempEmailAddress", action.emailAddress);
    case SET_VALID_EMAIL_ADDRESS_INPUT:
      return state.set("isEmailAddressInputValid", action.valid);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        searchTerm: defaultState.get("searchTerm"),
        searchBarDisplayed: defaultState.get("searchBarDisplayed")
      });
    default:
      return state;
  }
}
