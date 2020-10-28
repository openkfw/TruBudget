/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were doing this in store.js, reducers wouldn't be hot reloadable.
 */
import { connectRouter, LOCATION_CHANGE } from "connected-react-router";
import { fromJS } from "immutable";
import { combineReducers } from "redux-immutable";

import analyticsReducer from "./pages/Analytics/reducer";
import confirmationReducer from "./pages/Confirmation/reducer";
import documentsReducer from "./pages/Documents/reducer";
import loadingReducer from "./pages/Loading/reducer";
import loginReducer from "./pages/Login/reducer";
import navbarReducer from "./pages/Navbar/reducer";
import nodeDashboardReducer from "./pages/Nodes/reducer";
import notificationsReducer from "./pages/Notifications/reducer";
import overviewReducer from "./pages/Overview/reducer";
import statusReducer from "./pages/Status/reducer";
import subProjectReducer from "./pages/SubProjects/reducer";
import userDashboardReducer from "./pages/Users/reducer";
import workflowReducer from "./pages/Workflows/reducer";
import workflowitemDetailsReducer from "./pages/Workflows/WorkflowitemHistoryTab/reducer";

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to connected-react-router
 *
 */

// Initial routing state
const routeInitialState = fromJS({
  locationBeforeTransitions: null
});

export const actionInitialState = fromJS({
  lastAction: null
});

/**
 * Merge route into the global application state
 */
function lastActionReducer(state = actionInitialState, action) {
  return state.merge({
    lastAction: action.type
  });
}

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return state.merge({
        locationBeforeTransitions: action.payload.location
      });

    default:
      return state;
  }
}

const combinedReducer = (history, action) => {
  if (action.type === "LOGOUT") {
    return combineReducers({
      router: connectRouter(history),
      route: routeReducer,
      actions: lastActionReducer,
      login: loginReducer,
      // Passing an undefined state returns the defaultState
      navbar: (_state, action) => navbarReducer(undefined, action),
      overview: (_state, action) => overviewReducer(undefined, action),
      detailview: (_state, action) => subProjectReducer(undefined, action),
      workflow: (_state, action) => workflowReducer(undefined, action),
      workflowitemDetails: (_state, action) => workflowitemDetailsReducer(undefined, action),
      notifications: (_state, action) => notificationsReducer(undefined, action),
      documents: (_state, action) => documentsReducer(undefined, action),
      loading: (_state, action) => loadingReducer(undefined, action),
      users: (_state, action) => userDashboardReducer(undefined, action),
      nodes: (_state, action) => nodeDashboardReducer(undefined, action),
      analytics: (_state, action) => analyticsReducer(undefined, action),
      confirmation: (_state, action) => confirmationReducer(undefined, action),
      status: (_state, action) => statusReducer(undefined, action)
    });
  } else {
    return combineReducers({
      router: connectRouter(history),
      route: routeReducer,
      actions: lastActionReducer,
      navbar: navbarReducer,
      overview: overviewReducer,
      detailview: subProjectReducer,
      workflow: workflowReducer,
      workflowitemDetails: workflowitemDetailsReducer,
      notifications: notificationsReducer,
      login: loginReducer,
      documents: documentsReducer,
      loading: loadingReducer,
      users: userDashboardReducer,
      nodes: nodeDashboardReducer,
      analytics: analyticsReducer,
      confirmation: confirmationReducer,
      status: statusReducer
    });
  }
};

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
const createReducer = history => (state, action) => {
  return combinedReducer(history, action, state)(state, action);
};

export default createReducer;
