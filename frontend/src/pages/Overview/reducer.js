import { fromJS, Set } from "immutable";

import {
  PROJECT_NAME,
  PROJECT_PROJECTED_BUDGET,
  PROJECT_COMMENT,
  PROJECT_ORGANIZATION,
  CREATE_PROJECT_SUCCESS,
  PROJECT_CREATION_STEP,
  SHOW_CREATION_DIALOG,
  PROJECT_THUMBNAIL,
  FETCH_ALL_PROJECTS_SUCCESS,
  SHOW_EDIT_DIALOG,
  SHOW_PROJECT_PERMISSIONS,
  HIDE_PROJECT_PERMISSIONS,
  FETCH_PROJECT_PERMISSIONS_SUCCESS,
  HIDE_PROJECT_DIALOG,
  PROJECT_DELETED_PROJECTED_BUDGET
} from "./actions";
import { LOGOUT } from "../Login/actions";
import strings from "../../localizeStrings";

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
    organization: ""
  },
  idForPermissions: "",
  permissions: {},
  permissionDialogShown: false,
  currentStep: 0,
  initialFetch: false,
  nextButtonEnabled: false,
  roles: [],
  loading: false,
  logs: [],
  allowedIntents: [],
  dialogTitle: strings.project.add_new_project
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
          .set("projectedBudgets", fromJS(action.projectedBudgets)),
        currentStep: action.currentStep,
        editDialogShown: true
      });
    case SHOW_PROJECT_PERMISSIONS:
      return state.merge({ idForPermissions: action.id, permissionDialogShown: true });
    case HIDE_PROJECT_PERMISSIONS:
      return state.merge({
        idForPermissions: defaultState.get("id"),
        permissionDialogShown: false,
        permissions: fromJS({})
      });
    case HIDE_PROJECT_DIALOG:
      return state.merge({
        projectToAdd: defaultState.getIn(["projectToAdd"]),
        currentStep: defaultState.get("currentStep"),
        creationDialogShown: defaultState.get("creationDialogShown"),
        editDialogShown: defaultState.get("editDialogShown")
      });

    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state.set("permissions", fromJS(action.permissions));
    case PROJECT_NAME:
      return state.setIn(["projectToAdd", "displayName"], action.name);
    case PROJECT_PROJECTED_BUDGET:
      return state.merge({
        projectToAdd: state
          .getIn(["projectToAdd"])
          .set("projectedBudgets", fromJS(action.projectedBudgets))
          .set("organization", "")
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
    case PROJECT_ORGANIZATION:
      return state.setIn(["projectToAdd", "organization"], action.organization);
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
    case LOGOUT:
      return defaultState;
    default:
      return state;
  }
}
