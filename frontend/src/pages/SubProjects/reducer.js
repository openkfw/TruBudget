import { fromJS } from "immutable";

import strings from "../../localizeStrings";
import { LOGOUT } from "../Login/actions";
import { HIDE_HISTORY } from "../Notifications/actions";
import { FETCH_PROJECT_PERMISSIONS, FETCH_PROJECT_PERMISSIONS_SUCCESS } from "../Overview/actions";
import {
  ADD_TEMPORARY_SUBPROJECT_PERMISSION,
  CREATE_SUBPROJECT_SUCCESS,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_NEXT_PROJECT_HISTORY_PAGE,
  FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  HIDE_PROJECT_ASSIGNEES,
  HIDE_PROJECT_CONFIRMATION_DIALOG,
  HIDE_SUBPROJECT_ADDITIONAL_DATA,
  HIDE_SUBPROJECT_DIALOG,
  HIDE_SUBPROJECT_PERMISSIONS,
  OPEN_HISTORY,
  REMOVE_TEMPORARY_SUBPROJECT_PERMISSION,
  SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT,
  SHOW_PROJECT_ASSIGNEES,
  SHOW_PROJECT_CONFIRMATION_DIALOG,
  SHOW_SUBPROJECT_ADDITIONAL_DATA,
  SHOW_SUBPROJECT_CREATE,
  SHOW_SUBPROJECT_EDIT,
  SHOW_SUBPROJECT_PERMISSIONS,
  SUBPROJECT_COMMENT,
  SUBPROJECT_CURRENCY,
  SUBPROJECT_DELETED_PROJECTED_BUDGET,
  SUBPROJECT_NAME,
  SUBPROJECT_PROJECTED_BUDGETS,
  TRIGGER_APPLY_ACTIONS
} from "./actions";

const historyPageSize = 50;

const defaultState = fromJS({
  id: "",
  projectAdditionalData: "",
  projectTags: [],
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
  hasMoreHistory: true,
  roles: [],
  logs: [],
  historyItems: [],
  isHistoryLoading: false,
  totalHistoryItemCount: 0,
  historyPageSize: historyPageSize,
  currentHistoryPage: 0,
  lastHistoryPage: 1,
  allowedIntents: [],
  showSubProjectPermissions: false,
  isSubProjectAdditionalDataShown: false,
  idForInfo: "",
  permissions: { project: {}, subproject: {} },
  temporaryPermissions: {},
  idForPermissions: "",
  showProjectAssignees: false,
  projectAssignee: "",
  dialogTitle: strings.subproject.subproject_add_title,
  isFetchingProjectPermissions: false,
  confirmation: {
    visible: false,
    actions: [],
    assignee: {
      id: "",
      displayName: ""
    }
  },
  permittedToGrant: false,
  applyActions: true
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
        projectAdditionalData: fromJS(action.project.data.additionalData),
        projectTags: fromJS(action.project.data.tags),
        allowedIntents: fromJS(action.project.allowedIntents),
        logs: fromJS(action.project.log),
        subProjects: fromJS(action.subprojects)
      });

    case SHOW_SUBPROJECT_PERMISSIONS:
      return state.merge({
        permissions: defaultState.get("permissions"),
        temporaryPermissions: defaultState.get("temporaryPermissions"),
        idForPermissions: action.id,
        showSubProjectPermissions: true
      });
    case SHOW_SUBPROJECT_ADDITIONAL_DATA:
      return state.merge({
        idForInfo: fromJS(action.id),
        isSubProjectAdditionalDataShown: true
      });
    case SHOW_PROJECT_CONFIRMATION_DIALOG:
      return state.merge({
        confirmation: {
          visible: true,
          actions: fromJS(action.actions),
          assignee: fromJS(action.assignee)
        },
        permittedToGrant: action.permittedToGrant,
        applyActions: true
      });
    case HIDE_PROJECT_CONFIRMATION_DIALOG:
      return state.merge({
        confirmation: defaultState.get("confirmation"),
        applyActions: true
      });
    case TRIGGER_APPLY_ACTIONS:
      return state.set("applyActions", !state.get("applyActions"));
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "subproject"], fromJS(action.permissions))
        .set("temporaryPermissions", fromJS(action.permissions));
    case FETCH_PROJECT_PERMISSIONS:
      return state.set("isFetchingProjectPermissions", true);
    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "project"], fromJS(action.permissions))
        .set("isFetchingProjectPermissions", false);
    case HIDE_SUBPROJECT_PERMISSIONS:
      return state.merge({
        idForPermissions: defaultState.get("idForPermissions"),
        showSubProjectPermissions: defaultState.get("showSubProjectPermissions"),
        permissions: defaultState.getIn(["permissions"])
      });
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
    case FETCH_NEXT_PROJECT_HISTORY_PAGE:
      return state.set("isHistoryLoading", true);
    case SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT:
      return state.merge({
        totalHistoryItemCount: action.totalHistoryItemsCount,
        lastHistoryPage: action.lastHistoryPage
      });

    case FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: state.get("historyItems").concat(fromJS(action.events).reverse()),
        currentHistoryPage: action.currentHistoryPage,
        isHistoryLoading: false
      });
    case OPEN_HISTORY:
      return state.set("showHistory", true).set("isHistoryLoading", true);

    case HIDE_HISTORY:
      return state.merge({
        historyItems: fromJS([]),
        showHistory: false,
        lastHistoryPage: defaultState.get("lastHistoryPage"),
        currentHistoryPage: defaultState.get("currentHistoryPage"),
        totalHistoryItemCount: defaultState.get("totalHistoryItemCount")
      });
    case SHOW_SUBPROJECT_EDIT: {
      return state
        .updateIn(["subprojectToAdd"], subproject =>
          subproject
            .set("id", action.id)
            .set("displayName", action.name)
            .set("description", action.description)
            .set("currency", action.currency)
            .set("projectedBudgets", fromJS(action.projectedBudgets))
        )
        .merge({
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
    case ADD_TEMPORARY_SUBPROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users => users.push(action.userId));
    case REMOVE_TEMPORARY_SUBPROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users =>
        users.filter(user => user !== action.userId)
      );
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
