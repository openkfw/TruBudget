import { fromJS, Set } from "immutable";
import _isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
import { CONFIRMATION_CANCELLED, CONFIRMATION_CONFIRMED } from "../Confirmation/actions";
import {
  DISABLE_ALL_LIVE_UPDATES,
  ENABLE_ALL_LIVE_UPDATES,
  SEARCH_BAR_DISPLAYED,
  SET_SELECTED_VIEW
} from "../Navbar/actions";

import {
  ADD_PROJECT_CUSTOM_IMAGE,
  ADD_PROJECT_PROJECTED_BUDGET,
  ADD_PROJECT_TAG,
  ADD_TEMPORARY_PROJECT_PERMISSION,
  CREATE_PROJECT_SUCCESS,
  EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT,
  FETCH_ALL_PROJECTS_SUCCESS,
  FETCH_COMPLETE_LIST_OF_PROJECTS_SUCCESS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  FETCH_PROJECTS_V2_SUCCESS,
  HIDE_PROJECT_ADDITIONAL_DATA,
  HIDE_PROJECT_DIALOG,
  HIDE_PROJECT_PERMISSIONS,
  LIVE_UPDATE_ALL_PROJECTS_DISABLE,
  LIVE_UPDATE_ALL_PROJECTS_ENABLE,
  PROJECT_COMMENT,
  PROJECT_CREATION_STEP,
  PROJECT_DELETED_PROJECTED_BUDGET,
  PROJECT_NAME,
  PROJECT_THUMBNAIL,
  REMOVE_PROJECT_CUSTOM_IMAGE,
  REMOVE_PROJECT_TAG,
  REMOVE_TEMPORARY_PROJECT_PERMISSION,
  SET_PAGE,
  SET_ROWS_PER_PAGE,
  SET_SORT,
  SHOW_CREATION_DIALOG,
  SHOW_EDIT_DIALOG,
  SHOW_PROJECT_ADDITIONAL_DATA,
  SHOW_PROJECT_PERMISSIONS,
  STORE_FILTERED_PROJECTS,
  STORE_PROJECT_VIEW,
  STORE_SEARCH_TERMS_AS_ARRAY
} from "./actions";

export const defaultState = fromJS({
  projects: Set(),
  pagination: {
    totalRecords: 0,
    limit: 10,
    totalPages: 1,
    currentPage: 1,
    nextPage: null,
    prevPage: null
  },
  filteredProjects: Set(),
  creationDialogShown: false,
  editDialogShown: false,
  projectToAdd: {
    id: "",
    displayName: "",
    description: "",
    thumbnail: "/Default_thumbnail.jpg",
    projectedBudgets: [],
    deletedProjectedBudgets: [],
    additionalData: {},
    tags: []
  },
  idForPermissions: "",
  displayNameForPermissions: "",
  permissions: { project: {} },
  temporaryPermissions: {},
  permissionDialogShown: false,
  currentStep: 0,
  initialFetch: false,
  nextButtonEnabled: false,
  roles: [],
  loading: false,
  allowedIntents: [],
  dialogTitle: strings.project.add_new_project,
  idForInfo: "",
  isProjectAdditionalDataShown: false,
  searchTerms: [],
  projectView: "card",
  isLiveUpdateAllProjectsEnabled: true,
  page: 1,
  limit: 10,
  sort: { column: null, direction: null }
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SHOW_CREATION_DIALOG:
      return state.merge({ creationDialogShown: true, dialogTitle: strings.project.add_new_project });
    case SHOW_EDIT_DIALOG:
      return state.merge({
        dialogTitle: strings.project.project_edit_title,
        projectToAdd: state
          .getIn(["projectToAdd"])
          .set("id", action.id)
          .set("displayName", action.displayName)
          .set("description", action.description)
          .set("thumbnail", action.thumbnail)
          .set("projectedBudgets", fromJS(action.projectedBudgets))
          .set("tags", fromJS(action.tags)),
        currentStep: action.currentStep,
        editDialogShown: true
      });
    case SHOW_PROJECT_PERMISSIONS:
      return state.merge({
        idForPermissions: action.id,
        displayNameForPermissions: action.displayName,
        permissionDialogShown: true,
        permissions: defaultState.get("permissions"),
        temporaryPermissions: defaultState.get("temporaryPermissions")
      });
    case HIDE_PROJECT_PERMISSIONS:
    case CONFIRMATION_CONFIRMED:
      return state.merge({
        idForPermissions: defaultState.get("idForPermissions"),
        displayNameForPermissions: defaultState.get("displayNameForPermissions"),
        permissionDialogShown: defaultState.get("permissionDialogShown"),
        permissions: defaultState.get("permissions"),
        temporaryPermissions: defaultState.get("temporaryPermissions")
      });
    case SHOW_PROJECT_ADDITIONAL_DATA:
      return state.merge({
        idForInfo: fromJS(action.id),
        isProjectAdditionalDataShown: true,
        isLiveUpdateAllProjectsEnabled: false
      });
    case HIDE_PROJECT_ADDITIONAL_DATA:
      return state.merge({
        isProjectAdditionalDataShown: false,
        isLiveUpdateAllProjectsEnabled: true
      });
    case HIDE_PROJECT_DIALOG:
      return state.merge({
        projectToAdd: defaultState.getIn(["projectToAdd"]),
        currentStep: defaultState.get("currentStep"),
        creationDialogShown: defaultState.get("creationDialogShown"),
        editDialogShown: defaultState.get("editDialogShown")
      });

    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state
        .setIn(["permissions", "project"], fromJS(action.permissions))
        .set("temporaryPermissions", fromJS(action.permissions));
    case PROJECT_NAME:
      return state.setIn(["projectToAdd", "displayName"], action.name);
    case ADD_PROJECT_PROJECTED_BUDGET:
      return state.merge({
        projectToAdd: state.get("projectToAdd").merge({
          projectedBudgets: fromJS([
            ...state.getIn(["projectToAdd", "projectedBudgets"]).toJS(),
            fromJS(action.projectedBudget)
          ])
        })
      });
    case EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT: {
      let newStateWithEditedBudget;
      state
        .getIn(["projectToAdd", "projectedBudgets"])
        .toJS()
        .forEach((b, index) => {
          if (
            b.organization === action.projectedBudget.organization &&
            b.currencyCode === action.projectedBudget.currencyCode
          ) {
            newStateWithEditedBudget = state.setIn(
              ["projectToAdd", "projectedBudgets", index, "value"],
              fromJS(action.budgetAmountEdit)
            );
          }
        });
      return newStateWithEditedBudget;
    }
    case PROJECT_DELETED_PROJECTED_BUDGET: {
      const projectedBudgets = state.getIn(["projectToAdd", "projectedBudgets"]).toJS();
      const projectedBudgetsToDelete = action.projectedBudgets;
      const newState = state.merge({
        projectToAdd: state.get("projectToAdd").merge({
          deletedProjectedBudgets: fromJS(projectedBudgetsToDelete),
          projectedBudgets: fromJS(
            projectedBudgets.filter(
              (b) =>
                projectedBudgetsToDelete.find(
                  (d) => d.organization === b.organization && d.currencyCode === b.currencyCode
                ) === undefined
            )
          )
        })
      });
      return newState;
    }
    case PROJECT_COMMENT:
      return state.setIn(["projectToAdd", "description"], action.comment);
    case ADD_PROJECT_TAG: {
      const tags = state.getIn(["projectToAdd", "tags"]) || [];
      if (!tags.some((tag) => tag === action.tag)) {
        return state.setIn(["projectToAdd", "tags"], [...tags, action.tag]);
      }
      return state;
    }
    case REMOVE_PROJECT_TAG: {
      const tags = state.getIn(["projectToAdd", "tags"]);
      return state.setIn(
        ["projectToAdd", "tags"],
        tags.filter((tag) => tag !== action.tag)
      );
    }
    case ADD_PROJECT_CUSTOM_IMAGE: {
      return state
        .setIn(["projectToAdd", "customImage"], action.customImage)
        .setIn(["projectToAdd", "thumbnail"], action.customImage);
    }
    case REMOVE_PROJECT_CUSTOM_IMAGE: {
      return state.setIn(["projectToAdd", "customImage"], "");
    }
    case PROJECT_THUMBNAIL:
      return state.setIn(["projectToAdd", "thumbnail"], action.thumbnail);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        projectToAdd: defaultState.getIn(["projectToAdd"]),
        searchTerms: defaultState.get("searchTerms")
      });
    case PROJECT_CREATION_STEP:
      return state.set("currentStep", action.step);
    case FETCH_ALL_PROJECTS_SUCCESS:
    case FETCH_PROJECTS_V2_SUCCESS:
      // While searching, fetching projects may not update the project list
      if (state.get("searchTerms").size === 0) {
        state = state.set("filteredProjects", action.projects);
      }
      state = state.set("projects", fromJS(action.projects));
      if (action.pagination) {
        state = state.set("pagination", fromJS(action.pagination));
      }
      return state;
    case FETCH_COMPLETE_LIST_OF_PROJECTS_SUCCESS:
        state = state.set("projectsAll", fromJS(action.projects));
        return state;
    case ADD_TEMPORARY_PROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], (users) => users.push(action.userId));
    case REMOVE_TEMPORARY_PROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], (users) =>
        users.filter((user) => user !== action.userId)
      );
    case CONFIRMATION_CANCELLED:
      return state.set(
        "temporaryPermissions",
        !_isEmpty(action.permissions) && !_isEmpty(action.permissions.project)
          ? fromJS(action.permissions.project)
          : defaultState.get("temporaryPermissions")
      );
    case STORE_FILTERED_PROJECTS:
      return state.set("filteredProjects", fromJS(action.filteredProjects));
    case STORE_SEARCH_TERMS_AS_ARRAY:
      return state.set("searchTerms", fromJS(action.searchTerms));
    case SEARCH_BAR_DISPLAYED:
      return state.merge({
        searchTerms: defaultState.get("searchTerms")
      });
    case SET_SELECTED_VIEW:
      return state.merge({
        // Reset searched projects and searchTerm in <Highlighter/>
        filteredProjects: state.get("projects"),
        searchTerms: defaultState.get("searchTerms")
      });
    case STORE_PROJECT_VIEW:
      return state.set("projectView", fromJS(action.projectView));
    case DISABLE_ALL_LIVE_UPDATES:
    case LIVE_UPDATE_ALL_PROJECTS_DISABLE:
      return state.set("isLiveUpdateAllProjectsEnabled", false);
    case ENABLE_ALL_LIVE_UPDATES:
    case LIVE_UPDATE_ALL_PROJECTS_ENABLE:
      return state.set("isLiveUpdateAllProjectsEnabled", true);
    case SET_PAGE:
      return state.set("page", action.page);
    case SET_ROWS_PER_PAGE:
      return state.set("limit", action.limit).set("page", action.page);
    case SET_SORT:
      return state.set("sort", { column: action.column, direction: action.direction });
    default:
      return state;
  }
}
