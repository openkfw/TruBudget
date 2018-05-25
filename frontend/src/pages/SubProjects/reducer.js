import { fromJS } from "immutable";

import {
  SUBPROJECT_NAME,
  SUBPROJECT_AMOUNT,
  SUBPROJECT_COMMENT,
  SUBPROJECT_CURRENCY,
  CREATE_SUBPROJECT_SUCCESS,
  SHOW_SUBPROJECT_DIALOG,
  CANCEL_SUBPROJECT_DIALOG,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  SHOW_PROJECT_PERMISSIONS,
  HIDE_PROJECT_PERMISSIONS,
  SHOW_PROJECT_ASSIGNEES,
  HIDE_PROJECT_ASSIGNEES,
  FETCH_PROJECT_HISTORY_SUCCESS
} from "./actions";
import { LOGOUT } from "../Login/actions";

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
  projectAssignee: [],
  projectApprover: [],
  projectBank: [],
  subProjects: [],
  subProjectName: "",
  subprojectsDialogVisible: false,
  subProjectAmount: "",
  subProjectComment: "",
  subProjectCurrency: "",
  showHistory: false,
  roles: [],
  permissions: {},
  logs: [],
  historyItems: [],
  thumbnail: "/Thumbnail_0001.jpg",
  allowedIntents: [],
  permissionDialogShown: false,
  showProjectAssignees: false
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
    case SHOW_SUBPROJECT_DIALOG:
      return state.set("subprojectsDialogVisible", true);
    case CANCEL_SUBPROJECT_DIALOG:
      return state.merge({
        subProjectName: defaultState.get("subProjectName"),
        subProjectAmount: defaultState.get("subProjectAmount"),
        subProjectComment: defaultState.get("subProjectComment"),
        subProjectCurrency: defaultState.get("subProjectCurrency"),
        subprojectsDialogVisible: defaultState.get("subprojectsDialogVisible")
      });
    case SUBPROJECT_NAME:
      return state.set("subProjectName", action.name);
    case SUBPROJECT_AMOUNT:
      return state.set("subProjectAmount", action.amount);
    case SUBPROJECT_COMMENT:
      return state.set("subProjectComment", action.comment);
    case SUBPROJECT_CURRENCY:
      return state.set("subProjectCurrency", action.currency);
    case CREATE_SUBPROJECT_SUCCESS:
      return state.merge({
        subProjectName: defaultState.get("subProjectName"),
        subProjectAmount: defaultState.get("subProjectAmount"),
        subProjectComment: defaultState.get("subProjectComment"),
        subProjectCurrency: defaultState.get("subProjectCurrency")
      });
    case SHOW_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", true);
    case HIDE_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", false);
    case FETCH_PROJECT_HISTORY_SUCCESS:
      return state.set("historyItems", fromJS(action.events));
    case HIDE_HISTORY:
      return state.set("historyItems", fromJS([]));
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
