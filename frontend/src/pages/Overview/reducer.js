import { fromJS, Set } from "immutable";

import {
  PROJECT_NAME,
  PROJECT_AMOUNT,
  PROJECT_COMMENT,
  PROJECT_CURRENCY,
  CREATE_PROJECT_SUCCESS,
  PROJECT_CREATION_STEP,
  SHOW_CREATION_DIALOG,
  PROJECT_THUMBNAIL,
  HIDE_CREATION_DIALOG,
  FETCH_ALL_PROJECTS_SUCCESS,
  SHOW_EDIT_DIALOG,
  HIDE_EDIT_DIALOG
} from "./actions";
import { LOGOUT } from "../Login/actions";

const defaultState = fromJS({
  projects: Set(),
  creationDialogShown: false,
  editDialogShown: false,
  projectToAdd: {
    id: "",
    displayName: "",
    amount: "",
    description: "",
    thumbnail: "/Thumbnail_0001.jpg",
    currency: "EUR"
  },

  currentStep: 0,
  initialFetch: false,
  nextButtonEnabled: false,
  roles: [],
  loading: false,
  logs: [],
  allowedIntents: []
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case SHOW_CREATION_DIALOG:
      return state.set("creationDialogShown", true);
    case SHOW_EDIT_DIALOG:
      return state.merge({
        projectToAdd: state
          .getIn(["projectToAdd"])
          .set("id", action.id)
          .set("displayName", action.displayName)
          .set("amount", action.amount)
          .set("description", action.description)
          .set("currency", action.currency)
          .set("thumbnail", action.thumbnail),
        currentStep: action.currentStep,
        editDialogShown: true
      });

    case HIDE_CREATION_DIALOG:
      return state.merge({
        projectToAdd: defaultState.getIn(["projectToAdd"]),
        currentStep: defaultState.get("currentStep"),
        creationDialogShown: defaultState.get("creationDialogShown")
      });
    case HIDE_EDIT_DIALOG:
      return state.merge({
        projectToAdd: defaultState.getIn(["projectToAdd"]),
        currentStep: defaultState.get("currentStep"),
        editDialogShown: defaultState.get("editDialogShown")
      });
    case PROJECT_NAME:
      return state.setIn(["projectToAdd", "displayName"], action.name);
    case PROJECT_AMOUNT:
      return state.setIn(["projectToAdd", "amount"], action.amount);
    case PROJECT_COMMENT:
      return state.setIn(["projectToAdd", "description"], action.comment);
    case PROJECT_CURRENCY:
      return state.setIn(["projectToAdd", "currency"], action.currency);
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
