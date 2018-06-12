import { fromJS } from "immutable";

import {
  SUBPROJECT_NAME,
  SUBPROJECT_AMOUNT,
  SUBPROJECT_COMMENT,
  SUBPROJECT_CURRENCY,
  CREATE_SUBPROJECT_SUCCESS,
  SHOW_CREATE_DIALOG,
  HIDE_CREATE_DIALOG,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  SHOW_PROJECT_PERMISSIONS,
  HIDE_PROJECT_PERMISSIONS,
  SHOW_PROJECT_ASSIGNEES,
  HIDE_PROJECT_ASSIGNEES,
  FETCH_PROJECT_HISTORY_SUCCESS,
  SHOW_EDIT_DIALOG
} from "./actions";
import { LOGOUT } from "../Login/actions";

import { fromAmountString } from "../../helper";
import { HIDE_HISTORY } from "../Notifications/actions";
import { HIDE_EDIT_DIALOG } from "../Overview/actions";

const defaultState = fromJS({
  id: "",
  projectName: "",
  projectAmount: "",
  projectCurrency: "",
  projectComment: "Default Comment",
  projectStatus: "open",
  projectTS: 0,
  subProjects: [],
  subprojectToAdd: {
    id: "",
    displayName: "",
    amount: "",
    description: "",
    currency: ""
  },
  createDialogShown: false,
  editDialogShown: false,
  showHistory: false,
  roles: [],
  permissions: {},
  logs: [],
  historyItems: [],
  allowedIntents: [],
  permissionDialogShown: false,
  showProjectAssignees: false,
  projectAssignee: ""
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      return state.merge({
        id: action.project.data.id,
        projectName: action.project.data.displayName,
        projectAmount: fromAmountString(action.project.data.amount),
        projectCurrency: action.project.data.currency,
        projectComment: action.project.data.description,
        projectStatus: action.project.data.status,
        projectTS: action.project.data.creationUnixTs,
        projectAssignee: action.project.data.assignee,
        allowedIntents: fromJS(action.project.allowedIntents),
        logs: fromJS(action.project.log),
        subProjects: fromJS(action.subprojects)
      });
    case SHOW_PROJECT_PERMISSIONS:
      return state.set("permissionDialogShown", true);
    case HIDE_PROJECT_PERMISSIONS:
      return state.merge({
        permissionDialogShown: false,
        permissions: fromJS({})
      });
    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state.set("permissions", fromJS(action.permissions));
    case SHOW_CREATE_DIALOG:
      return state.set("createDialogShown", true);
    case HIDE_CREATE_DIALOG:
      return state.merge({ subprojectToAdd: defaultState.getIn(["subprojectToAdd"]), createDialogShown: false });
    case SUBPROJECT_NAME:
      return state.setIn(["subprojectToAdd", "displayName"], action.name);
    case SUBPROJECT_AMOUNT:
      return state.setIn(["subprojectToAdd", "amount"], action.amount);
    case SUBPROJECT_COMMENT:
      return state.setIn(["subprojectToAdd", "description"], action.description);
    case SUBPROJECT_CURRENCY:
      return state.setIn(["subprojectToAdd", "currency"], action.currency);
    case CREATE_SUBPROJECT_SUCCESS:
      return state.set("subprojectToAdd", defaultState.getIn(["subprojectToAdd"]));
    case SHOW_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", true);
    case HIDE_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", false);
    case FETCH_PROJECT_HISTORY_SUCCESS:
      return state.set("historyItems", fromJS(action.events));
    case SHOW_EDIT_DIALOG: {
      return state.merge({
        subprojectToAdd: state
          .getIn(["subprojectToAdd"])
          .set("id", action.id)
          .set("displayName", action.name)
          .set("amount", action.amount)
          .set("description", action.description)
          .set("currency", action.currency),
        editDialogShown: true
      });
    }
    case HIDE_EDIT_DIALOG: {
      return state.merge({ editDialogShown: false, subprojectToAdd: defaultState.getIn(["subprojectToAdd"]) });
    }
    case HIDE_HISTORY:
      return state.set("historyItems", fromJS([]));
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
