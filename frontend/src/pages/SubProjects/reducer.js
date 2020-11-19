import { fromJS } from "immutable";
import _isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";
import { CONFIRMATION_CANCELLED, CONFIRMATION_CONFIRMED } from "../Confirmation/actions";
import { HIDE_HISTORY } from "../Notifications/actions";
import { FETCH_PROJECT_PERMISSIONS_SUCCESS } from "../Overview/actions";
import {
  ADD_TEMPORARY_SUBPROJECT_PERMISSION,
  CREATE_SUBPROJECT_SUCCESS,
  DISABLE_LIVE_UPDATES_PROJECT,
  ENABLE_LIVE_UPDATES_PROJECT,
  FETCH_ALL_PROJECT_DETAILS_SUCCESS,
  FETCH_NEXT_PROJECT_HISTORY_PAGE,
  FETCH_NEXT_PROJECT_HISTORY_PAGE_SUCCESS,
  FETCH_SUBPROJECT_PERMISSIONS_SUCCESS,
  HIDE_PROJECT_ASSIGNEES,
  HIDE_SUBPROJECT_ADDITIONAL_DATA,
  HIDE_SUBPROJECT_DIALOG,
  HIDE_SUBPROJECT_PERMISSIONS,
  OPEN_HISTORY,
  REMOVE_TEMPORARY_SUBPROJECT_PERMISSION,
  SET_TOTAL_PROJECT_HISTORY_ITEM_COUNT,
  SHOW_PROJECT_ASSIGNEES,
  SHOW_SUBPROJECT_ADDITIONAL_DATA,
  SHOW_SUBPROJECT_CREATE,
  SHOW_SUBPROJECT_EDIT,
  SHOW_SUBPROJECT_PERMISSIONS,
  SUBPROJECT_COMMENT,
  SUBPROJECT_CURRENCY,
  SUBPROJECT_VALIDATOR,
  SUBPROJECT_WORKFLOWITEMTYPE,
  SUBPROJECT_DELETED_PROJECTED_BUDGET,
  SUBPROJECT_NAME,
  ADD_SUBPROJECT_PROJECTED_BUDGET,
  EDIT_SUBPROJECT_PROJECTED_BUDGET_AMOUNT,
  SUBPROJECT_SEARCH_BAR_DISPLAYED,
  SUBPROJECT_SEARCH_TERM,
  SUBPROJECT_STORE_FILTERED_PROJECTS,
  SUBPROJECT_STORE_HIGHLIGHTING_REGEX,
  SUBPROJECT_STORE_SEARCH_TERMS_AS_ARRAY,
  FETCH_FIRST_PROJECT_HISTORY_PAGE,
  FETCH_FIRST_PROJECT_HISTORY_PAGE_SUCCESS
} from "./actions";
import { convertToURLQuery } from "../../helper";
import { ENABLE_ALL_LIVE_UPDATES, DISABLE_ALL_LIVE_UPDATES } from "../Navbar/actions";

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
  filteredSubProjects: [],
  subprojectToAdd: {
    id: "",
    displayName: "",
    description: "",
    currency: "",
    projectedBudgets: [],
    deletedProjectedBudgets: [],
    validator: "",
    workflowitemType: "any"
  },
  idsPermissionsUnassigned: [],
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
  displayNameForPermissions: "",
  showProjectAssignees: false,
  projectAssignee: "",
  dialogTitle: strings.subproject.subproject_add_title,
  searchTerm: "",
  searchTerms: [],
  searchBarDisplayed: true,
  highlightingRegex: "",
  isLiveUpdatesProjectEnabled: true
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      // While searching, stop updating the subproject list from new fetched subprojects
      if (state.get("searchTerms").size === 0) {
        state = state.set("filteredSubProjects", action.subprojects);
      }
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
        displayNameForPermissions: action.displayName,
        showSubProjectPermissions: true,
        idsPermissionsUnassigned: state.get("idsPermissionsUnassigned").filter(id => id !== action.id)
      });
    case SHOW_SUBPROJECT_ADDITIONAL_DATA:
      return state.merge({
        idForInfo: fromJS(action.id),
        isSubProjectAdditionalDataShown: true
      });
    case FETCH_SUBPROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "subproject"], fromJS(action.permissions))
        .set("temporaryPermissions", fromJS(action.permissions));
    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state.setIn(["permissions", "project"], fromJS(action.permissions));
    case HIDE_SUBPROJECT_PERMISSIONS:
    case CONFIRMATION_CONFIRMED:
      return state.merge({
        idForPermissions: defaultState.get("idForPermissions"),
        displayNameForPermissions: defaultState.get("displayNameForPermissions"),
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
    case SUBPROJECT_VALIDATOR:
      return state.setIn(["subprojectToAdd", "validator"], action.validator);
    case SUBPROJECT_WORKFLOWITEMTYPE:
      return state.setIn(["subprojectToAdd", "workflowitemType"], action.workflowitemType);
    case ADD_SUBPROJECT_PROJECTED_BUDGET:
      return state.merge({
        subprojectToAdd: state.get("subprojectToAdd").merge({
          projectedBudgets: [...state.getIn(["subprojectToAdd", "projectedBudgets"]).toJS(), action.projectedBudget]
        })
      });
    case EDIT_SUBPROJECT_PROJECTED_BUDGET_AMOUNT:
      let newStateWithEditedBudget;
      state
        .getIn(["subprojectToAdd", "projectedBudgets"])
        .toJS()
        .forEach((b, index) => {
          if (
            b.organization === action.projectedBudget.organization &&
            b.currencyCode === action.projectedBudget.currencyCode
          ) {
            newStateWithEditedBudget = state.setIn(
              ["subprojectToAdd", "projectedBudgets", index, "value"],
              action.budgetAmountEdit
            );
          }
        });
      return newStateWithEditedBudget;
    case SUBPROJECT_DELETED_PROJECTED_BUDGET:
      const projectedBudgets = state.getIn(["subprojectToAdd", "projectedBudgets"]).toJS();
      const projectedBudgetsToDelete = action.projectedBudgets;
      const newState = state.merge({
        subprojectToAdd: state.get("subprojectToAdd").merge({
          deletedProjectedBudgets: [
            ...state.getIn(["subprojectToAdd", "deletedProjectedBudgets"]),
            ...projectedBudgetsToDelete
          ],
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
      return state.merge({
        highlightingRegex: defaultState.get("highlightingRegex"),
        subprojectToAdd: defaultState.get("subprojectToAdd"),
        idsPermissionsUnassigned: state.get("idsPermissionsUnassigned").concat(fromJS(action.subprojectId))
      });
    case SHOW_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", true);
    case HIDE_PROJECT_ASSIGNEES:
      return state.set("showProjectAssignees", false);
    case HIDE_SUBPROJECT_ADDITIONAL_DATA:
      return state.set("isSubProjectAdditionalDataShown", false);
    case FETCH_FIRST_PROJECT_HISTORY_PAGE:
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
    case FETCH_FIRST_PROJECT_HISTORY_PAGE_SUCCESS:
      return state.merge({
        historyItems: fromJS(action.events).reverse(),
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
            .set("deletedProjectedBudgets", fromJS([]))
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
    case CONFIRMATION_CANCELLED:
      return state.set(
        "temporaryPermissions",
        !_isEmpty(action.permissions) && !_isEmpty(action.permissions.subproject)
          ? fromJS(action.permissions.subproject)
          : defaultState.get("temporaryPermissions")
      );

    case SUBPROJECT_SEARCH_TERM:
      const querySearchTerm = convertToURLQuery(action.searchTerm);
      window.history.replaceState("", "Title", "?" + querySearchTerm);
      return state.set("searchTerm", action.searchTerm);
    case SUBPROJECT_SEARCH_BAR_DISPLAYED:
      return state.merge({
        searchTerms: defaultState.get("searchTerms"),
        highlightingRegex: defaultState.get("highlightingRegex"),
        searchBarDisplayed: action.searchBarDisplayed
      });
    case SUBPROJECT_STORE_FILTERED_PROJECTS:
      return state.set("filteredSubProjects", fromJS(action.filteredSubProjects));
    case SUBPROJECT_STORE_HIGHLIGHTING_REGEX:
      return state.set("highlightingRegex", fromJS(action.highlightingRegex));
    case SUBPROJECT_STORE_SEARCH_TERMS_AS_ARRAY:
      return state.set("searchTerms", fromJS(action.searchTerms));
    case DISABLE_ALL_LIVE_UPDATES:
    case DISABLE_LIVE_UPDATES_PROJECT:
      return state.set("isLiveUpdatesProjectEnabled", false);
    case ENABLE_ALL_LIVE_UPDATES:
    case ENABLE_LIVE_UPDATES_PROJECT:
      return state.set("isLiveUpdatesProjectEnabled", true);
    default:
      return state;
  }
}
