import { fromJS, Map } from "immutable";

import { ADMIN_LOGOUT_SUCCESS, LOGIN_SUCCESS, LOGOUT_SUCCESS, SET_LANGUAGE } from "./pages/Login/actions";
import { defaultState as loginState } from "./pages/Login/reducer";
import {
  LIVE_UPDATE_ALL_PROJECTS_DISABLE,
  LIVE_UPDATE_ALL_PROJECTS_ENABLE,
  STORE_PROJECT_VIEW
} from "./pages/Overview/actions";
import { defaultState as overviewState } from "./pages/Overview/reducer";
import { actionInitialState as actionState } from "./reducers";

const STORAGE_KEY = "state";

const parseActions = (state) => state.getIn(["actions", "lastAction"]);

const parseFromState = (state) => ({
  login: {
    isUserLoggedIn: state.getIn(["login", "isUserLoggedIn"]),
    language: state.getIn(["login", "language"]),
    id: state.getIn(["login", "id"]),
    displayName: state.getIn(["login", "displayName"]),
    organization: state.getIn(["login", "organization"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]).toJS(),
    groups: state.getIn(["login", "groups"]).toJS(),
    emailServiceAvailable: state.getIn(["login", "emailServiceAvailable"]),
    exportServiceAvailable: state.getIn(["login", "exportServiceAvailable"])
  },
  overview: {
    projectView: state.getIn(["overview", "projectView"]),
    isLiveUpdateAllProjectsEnabled: state.getIn(["overview", "isLiveUpdateAllProjectsEnabled"])
  }
});

const defaultPersistedState = Map({
  login: loginState,
  actions: actionState,
  overview: overviewState
});

export const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    return serializedState !== null
      ? defaultPersistedState.mergeDeep(fromJS(JSON.parse(serializedState)))
      : defaultPersistedState;
  } catch (error) {
    return defaultPersistedState;
  }
};

const setStorage = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const saveToLocalStorage = (state) => {
  const action = parseActions(state);
  try {
    switch (action) {
      case LIVE_UPDATE_ALL_PROJECTS_DISABLE:
      case LIVE_UPDATE_ALL_PROJECTS_ENABLE:
      case LOGIN_SUCCESS:
      case SET_LANGUAGE:
      case STORE_PROJECT_VIEW:
      case ADMIN_LOGOUT_SUCCESS:
      case LOGOUT_SUCCESS: {
        const stateToPersist = parseFromState(state);
        setStorage(stateToPersist);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    // eslint-disable-next-line no-console
    console.error("failed to persist state");
  }
};
