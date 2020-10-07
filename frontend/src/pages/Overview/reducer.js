import { fromJS, Set } from "immutable";
import _isEmpty from "lodash/isEmpty";
import strings from "../../localizeStrings";
import { CONFIRMATION_CANCELLED, CONFIRMATION_CONFIRMED } from "../Confirmation/actions";
import { SEARCH_BAR_DISPLAYED } from "../Navbar/actions";
import {
  ADD_PROJECT_TAG,
  ADD_TEMPORARY_PROJECT_PERMISSION,
  CREATE_PROJECT_SUCCESS,
  FETCH_ALL_PROJECTS_SUCCESS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  HIDE_PROJECT_ADDITIONAL_DATA,
  HIDE_PROJECT_DIALOG,
  HIDE_PROJECT_PERMISSIONS,
  PROJECT_COMMENT,
  PROJECT_CREATION_STEP,
  PROJECT_DELETED_PROJECTED_BUDGET,
  PROJECT_NAME,
  ADD_PROJECT_PROJECTED_BUDGET,
  EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT,
  PROJECT_THUMBNAIL,
  REMOVE_PROJECT_TAG,
  REMOVE_TEMPORARY_PROJECT_PERMISSION,
  SHOW_CREATION_DIALOG,
  SHOW_EDIT_DIALOG,
  SHOW_PROJECT_ADDITIONAL_DATA,
  SHOW_PROJECT_PERMISSIONS,
  STORE_FILTERED_PROJECTS,
  STORE_HIGHLIGHTING_REGEX,
  STORE_SEARCH_TERMS_AS_ARRAY
} from "./actions";

const defaultState = fromJS({
  projects: Set(),
  filteredProjects: Set(),
  creationDialogShown: false,
  editDialogShown: false,
  projectToAdd: {
    id: "",
    displayName: "",
    description: "",
    thumbnail: "/Thumbnail_0001.jpg",
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
  logs: [],
  allowedIntents: [],
  dialogTitle: strings.project.add_new_project,
  idForInfo: "",
  isProjectAdditionalDataShown: false,
  highlightingRegex: "",
  searchTerms: []
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
        isProjectAdditionalDataShown: true
      });
    case HIDE_PROJECT_ADDITIONAL_DATA:
      return state.set("isProjectAdditionalDataShown", false);
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
          projectedBudgets: [...state.getIn(["projectToAdd", "projectedBudgets"]).toJS(), action.projectedBudget]
        })
      });
    case EDIT_PROJECT_PROJECTED_BUDGET_AMOUNT:
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
              action.budgetAmountEdit
            );
          }
        });
      return newStateWithEditedBudget;
    case PROJECT_DELETED_PROJECTED_BUDGET:
      const projectedBudgets = state.getIn(["projectToAdd", "projectedBudgets"]).toJS();
      const projectedBudgetsToDelete = action.projectedBudgets;
      const newState = state.merge({
        projectToAdd: state.get("projectToAdd").merge({
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
    case PROJECT_COMMENT:
      return state.setIn(["projectToAdd", "description"], action.comment);
    case ADD_PROJECT_TAG: {
      const tags = state.getIn(["projectToAdd", "tags"]) || [];
      if (!tags.some(tag => tag === action.tag)) {
        return state.setIn(["projectToAdd", "tags"], [...tags, action.tag]);
      }
      return state;
    }
    case REMOVE_PROJECT_TAG: {
      const tags = state.getIn(["projectToAdd", "tags"]);
      return state.setIn(
        ["projectToAdd", "tags"],
        tags.filter(tag => tag !== action.tag)
      );
    }
    case PROJECT_THUMBNAIL:
      return state.setIn(["projectToAdd", "thumbnail"], action.thumbnail);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        projectToAdd: defaultState.getIn(["projectToAdd"]),
        searchTerms: defaultState.get("searchTerms"),
        highlightingRegex: defaultState.get("highlightingRegex")
      });
    case PROJECT_CREATION_STEP:
      return state.set("currentStep", action.step);
    case FETCH_ALL_PROJECTS_SUCCESS:
      // While searching, fetching projects may not update the project list
      if (state.get("searchTerms").size === 0) {
        state = state.set("filteredProjects", action.projects);
      }
      return state.set("projects", fromJS(action.projects));
    case ADD_TEMPORARY_PROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users => users.push(action.userId));
    case REMOVE_TEMPORARY_PROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users =>
        users.filter(user => user !== action.userId)
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
    case STORE_HIGHLIGHTING_REGEX:
      return state.set("highlightingRegex", fromJS(action.highlightingRegex));
    case STORE_SEARCH_TERMS_AS_ARRAY:
      return state.set("searchTerms", fromJS(action.searchTerms));
    case SEARCH_BAR_DISPLAYED:
      return state.merge({
        searchTerms: defaultState.get("searchTerms"),
        highlightingRegex: defaultState.get("highlightingRegex")
      });
    default:
      return state;
  }
}
