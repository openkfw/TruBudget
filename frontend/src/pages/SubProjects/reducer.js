import { fromJS } from "immutable";

import strings from "../../localizeStrings";
import { LOGOUT } from "../Login/actions";
import { HIDE_HISTORY } from "../Notifications/actions";
import {
  CREATE_SUBPROJECT_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_PROJECT_HISTORY,
  FETCH_PROJECT_HISTORY_SUCCESS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  HIDE_PROJECT_ASSIGNEES,
  HIDE_SUBPROJECT_ADDITIONAL_DATA,
  HIDE_SUBPROJECT_DIALOG,
  HIDE_SUBPROJECT_PERMISSIONS,
  SET_HISTORY_OFFSET,
  SHOW_PROJECT_ASSIGNEES,
  SHOW_SUBPROJECT_ADDITIONAL_DATA,
  SHOW_SUBPROJECT_CREATE,
  SHOW_SUBPROJECT_EDIT,
  SHOW_SUBPROJECT_PERMISSIONS,
  SUBPROJECT_COMMENT,
  SUBPROJECT_CURRENCY,
  SUBPROJECT_DELETED_PROJECTED_BUDGET,
  SUBPROJECT_NAME,
  SUBPROJECT_PROJECTED_BUDGETS
} from "./actions";

const defaultState = fromJS({
  id: "",
  projectName: "",
  projectComment: "Default Comment",
  projectStatus: "open",
  projectProjectedBudgets: [],
  projectTS: 0,
  subProjects: [],
  subprojectToAdd: {
    id: "",
    displayName: "",
    description: "",
    currency: "",
    projectedBudgets: []
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
  isSubProjectAdditionalDataShown: false,
  idForInfo: "",
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
        projectComment: action.project.data.description,
        projectStatus: action.project.data.status,
        projectTS: action.project.data.creationUnixTs,
        projectAssignee: action.project.data.assignee,
        projectProjectedBudgets: fromJS(action.project.data.projectedBudgets),
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
    case SHOW_SUBPROJECT_ADDITIONAL_DATA:
      return state.merge({
        idForInfo: fromJS(action.id),
        isSubProjectAdditionalDataShown: true
      });
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
      return state.set("permissions", fromJS(action.permissions));
    case HIDE_SUBPROJECT_PERMISSIONS:
      return state.set("showSubProjectPermissions", false);
    case SHOW_SUBPROJECT_CREATE:
      return state.merge({ creationDialogShown: true, dialogTitle: strings.subproject.subproject_add_title });
    case SUBPROJECT_NAME:
      return state.setIn(["subprojectToAdd", "displayName"], action.name);
    case SUBPROJECT_COMMENT:
      return state.setIn(["subprojectToAdd", "description"], action.description);
    case SUBPROJECT_CURRENCY:
      return state.setIn(["subprojectToAdd", "currency"], action.currency);
    case SUBPROJECT_PROJECTED_BUDGETS:
      return state.setIn(["subprojectToAdd", "projectedBudgets"], fromJS(action.projectedBudgets));
    case SUBPROJECT_DELETED_PROJECTED_BUDGET:
      const projectedBudgets = state.getIn(["subprojectToAdd", "projectedBudgets"]).toJS();
      const projectedBudgetsToDelete = action.projectedBudgets;
      const newState = state.merge({
        subprojectToAdd: state.get("subprojectToAdd").merge({
          deletedProjectedBudgets: projectedBudgetsToDelete,
          projectedBudgets: projectedBudgets.filter(
            b =>
              projectedBudgetsToDelete.find(
                d => d.organization === b.organization && d.currencyCode === b.currencyCode
              ) === undefined
          )
        })
      });
      return newState;
    case CREATE_SUBPROJECT_SUCCESS:
      return state.set("subprojectToAdd", defaultState.getIn(["subprojectToAdd"]));
    case SHOW_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", true);
    case HIDE_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", false);
    case HIDE_SUBPROJECT_ADDITIONAL_DATA:
      return state.set("isSubProjectAdditionalDataShown", false);
    case SET_HISTORY_OFFSET:
      return state.set("offset", action.offset);
    case FETCH_PROJECT_HISTORY:
      return state.set("isHistoryLoading", true);
    case FETCH_PROJECT_HISTORY_SUCCESS:
      return state.merge({
        historyItems: fromJS(action.events).concat(state.get("historyItems")),
        historyItemsCount: action.historyItemsCount,
        isHistoryLoading: false,
        offset: action.offset,
        limit: action.limit
      });
    case SHOW_SUBPROJECT_EDIT: {
      return state.merge({
        subprojectToAdd: state
          .getIn(["subprojectToAdd"])
          .set("id", action.id)
          .set("displayName", action.name)
          .set("description", action.description)
          .set("currency", action.currency)
          .set("projectedBudgets", fromJS(action.projectedBudgets)),
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
        offset: defaultState.get("offset"),
        limit: defaultState.get("limit")
      });
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
