import { fromJS, Set } from "immutable";

import strings from "../../localizeStrings";
import { LOGOUT } from "../Login/actions";
import {
  CREATE_PROJECT_SUCCESS,
  FETCH_ALL_PROJECTS_SUCCESS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  HIDE_PROJECT_DIALOG,
  HIDE_PROJECT_PERMISSIONS,
  PROJECT_COMMENT,
  PROJECT_CREATION_STEP,
  PROJECT_DELETED_PROJECTED_BUDGET,
  PROJECT_NAME,
  PROJECT_PROJECTED_BUDGET,
  PROJECT_THUMBNAIL,
  SHOW_CREATION_DIALOG,
  SHOW_EDIT_DIALOG,
  SHOW_PROJECT_PERMISSIONS,
  HIDE_PROJECT_ADDITIONAL_DATA,
  SHOW_PROJECT_ADDITIONAL_DATA,
  ADD_PROJECT_TAG,
  REMOVE_PROJECT_TAG,
  ADD_TEMPORARY_PROJECT_PERMISSION,
  REMOVE_TEMPORARY_PROJECT_PERMISSION
} from "./actions";

const defaultState = fromJS({
  projects: Set(),
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
  permissions: {},
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
  isProjectAdditionalDataShown: false
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
      return state.merge({ idForPermissions: action.id, permissionDialogShown: true });
    case HIDE_PROJECT_PERMISSIONS:
      return state.merge({
        idForPermissions: defaultState.get("id"),
        permissionDialogShown: false,
        permissions: fromJS({}),
        temporaryPermissions: fromJS({})
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
        .set("permissions", fromJS(action.permissions))
        .set("temporaryPermissions", fromJS(action.permissions));
    case PROJECT_NAME:
      return state.setIn(["projectToAdd", "displayName"], action.name);
    case PROJECT_PROJECTED_BUDGET:
      return state.merge({
        projectToAdd: state.getIn(["projectToAdd"]).set("projectedBudgets", fromJS(action.projectedBudgets))
      });
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
      return state.setIn(["projectToAdd", "tags"], tags.filter(tag => tag !== action.tag));
    }
    case PROJECT_THUMBNAIL:
      return state.setIn(["projectToAdd", "thumbnail"], action.thumbnail);
    case CREATE_PROJECT_SUCCESS:
      return state.set("projectToAdd", defaultState.getIn(["projectToAdd"]));
    case PROJECT_CREATION_STEP:
      return state.set("currentStep", action.step);
    case FETCH_ALL_PROJECTS_SUCCESS:
      return state.merge({
        projects: fromJS(action.projects)
      });
    case ADD_TEMPORARY_PROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users => users.push(action.userId));
    case REMOVE_TEMPORARY_PROJECT_PERMISSION:
      return state.updateIn(["temporaryPermissions", action.permission], users =>
        users.filter(user => user !== action.userId)
      );
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
