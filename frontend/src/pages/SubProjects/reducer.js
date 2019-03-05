import { fromJS } from "immutable";

import {
  SUBPROJECT_NAME,
  SUBPROJECT_AMOUNT,
  SUBPROJECT_COMMENT,
  SUBPROJECT_CURRENCY,
  CREATE_SUBPROJECT_SUCCESS,
  HIDE_SUBPROJECT_DIALOG,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  SHOW_PROJECT_ASSIGNEES,
  HIDE_PROJECT_ASSIGNEES,
  FETCH_PROJECT_HISTORY,
  FETCH_PROJECT_HISTORY_SUCCESS,
  HIDE_SUBPROJECT_PERMISSIONS,
  SHOW_SUBPROJECT_PERMISSIONS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  SHOW_SUBPROJECT_CREATE,
  SHOW_SUBPROJECT_EDIT,
  SET_HISTORY_OFFSET
} from "./actions";
import { LOGOUT } from "../Login/actions";
import strings from "../../localizeStrings";
import { fromAmountString } from "../../helper";
import { HIDE_HISTORY } from "../Notifications/actions";

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
  creationDialogShown: false,
  editDialogShown: false,
  showHistory: false,
  roles: [],
  logs: [],
  historyItems: [],
  isHistoryLoading: false,
  historyItemsCount: 0,
  offset: 0,
  limit: 30,
  allowedIntents: [],
  showSubProjectPermissions: false,
  permissions: [],
  idForPermissions: "",
  showProjectAssignees: false,
  projectAssignee: "",
  dialogTitle: strings.subproject.subproject_add_title
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

    case SHOW_SUBPROJECT_PERMISSIONS:
      return state.merge({
        permissions: fromJS({}),
        idForPermissions: action.id,
        showSubProjectPermissions: true
      });
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
      return state.set("permissions", fromJS(action.permissions));
    case HIDE_SUBPROJECT_PERMISSIONS:
      return state.set("showSubProjectPermissions", false);
    case SHOW_SUBPROJECT_CREATE:
      return state.merge({ creationDialogShown: true, dialogTitle: strings.subproject.subproject_add_title });
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
    case SET_HISTORY_OFFSET:
      return state.set("offset", action.offset);
    case FETCH_PROJECT_HISTORY:
      return state.set("isHistoryLoading", true);
    case FETCH_PROJECT_HISTORY_SUCCESS:
      return state.merge({
        historyItems: [...state.get("historyItems"), ...fromJS(action.events)],
        historyItemsCount: action.historyItemsCount,
        isHistoryLoading: false,
        offset: action.offset
      });
    case SHOW_SUBPROJECT_EDIT: {
      return state.merge({
        subprojectToAdd: state
          .getIn(["subprojectToAdd"])
          .set("id", action.id)
          .set("displayName", action.name)
          .set("amount", action.amount)
          .set("description", action.description)
          .set("currency", action.currency),
        editDialogShown: true,
        dialogTitle: strings.subproject.subproject_edit_title
      });
    }
    case HIDE_SUBPROJECT_DIALOG: {
      return state.merge({
        editDialogShown: false,
        creationDialogShown: false,
        subprojectToAdd: defaultState.getIn(["subprojectToAdd"])
      });
    }
    case HIDE_HISTORY:
      return state.merge({
        historyItems: fromJS([]),
        offset: 0
      });
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
