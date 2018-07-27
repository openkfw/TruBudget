import { fromJS } from "immutable";

import {
  SET_USERNAME,
  SET_PASSWORD,
  SET_ORGANIZATION,
  SET_DISPLAYNAME,
  CREATE_USER_SUCCESS,
  RESET_USER,
  TAB_INDEX,
  SHOW_DASHBOARD_DIALOG,
  HIDE_DASHBOARD_DIALOG
} from "./actions";

const defaultState = fromJS({
  nodes: [],
  tabIndex: 0,
  dashboardDialogShown: false,
  userToAdd: {
    username: "",
    password: "",
    organization: "",
    displayName: ""
  },
  editId: "",
  dialogType: ""
});

export default function userDashboardReducer(state = defaultState, action) {
  switch (action.type) {
    case SET_ORGANIZATION:
      return state.setIn(["userToAdd", "organization"], action.organization);
    case SET_DISPLAYNAME:
      return state.setIn(["userToAdd", "displayName"], action.displayName);
    case SET_USERNAME:
      return state.setIn(["userToAdd", "username"], action.username);
    case SET_PASSWORD:
      return state.setIn(["userToAdd", "password"], action.password);
    case CREATE_USER_SUCCESS:
      console.log("CREATE_USER_SUCCESS");

    case RESET_USER:
      return state.set("userToAdd", defaultState.get("userToAdd"));
    case TAB_INDEX:
      return state.set("tabIndex", action.value);
    case SHOW_DASHBOARD_DIALOG:
      return state.merge({ "dashboardDialogShown": true, "dialogType": action.dialogType, "editId": action.editId });
    case HIDE_DASHBOARD_DIALOG:
      return state.merge({ "dashboardDialogShown": false, "userToAdd": defaultState.get("userToAdd") });
    default:
      return state;
  }
}
