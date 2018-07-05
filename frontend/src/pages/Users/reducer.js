import { fromJS } from "immutable";

import {
  SWITCH_TABS,
  SET_USERNAME,
  SET_PASSWORD,
  SET_ORGANIZATION,
  SET_DISPLAYNAME,
  FETCH_NODES_SUCCESS,
  CREATE_USER_SUCCESS,
  RESET_USER
} from "./actions";

const defaultState = fromJS({
  tabIndex: 0,
  nodes: [],
  x: "a",
  userToAdd: {
    username: "",
    password: "",
    organization: "",
    displayName: ""
  }
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SWITCH_TABS:
      return state.set("tabIndex", action.index);
    case SET_ORGANIZATION:
      return state.setIn(["userToAdd", "organization"], action.organization);
    case SET_DISPLAYNAME:
      return state.setIn(["userToAdd", "displayName"], action.displayName);
    case SET_USERNAME:
      return state.setIn(["userToAdd", "username"], action.username);
    case SET_PASSWORD:
      return state.setIn(["userToAdd", "password"], action.password);
    case CREATE_USER_SUCCESS:
    case RESET_USER:
      return state.set("userToAdd", defaultState.get("userToAdd"));
    case FETCH_NODES_SUCCESS:
      return state.set("nodes", action.nodes);
    default:
      return state;
  }
}
