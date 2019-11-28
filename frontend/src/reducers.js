/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { fromJS } from "immutable";
import { combineReducers } from "redux-immutable";
import { LOCATION_CHANGE, connectRouter } from "connected-react-router";

import navbarReducer from "./pages/Navbar/reducer";
import overviewReducer from "./pages/Overview/reducer";
import subProjectReducer from "./pages/SubProjects/reducer";
import dashboardReducer from "./pages/Dashboard/reducer";
import notificationsReducer from "./pages/Notifications/reducer";
import workflowReducer from "./pages/Workflows/reducer";
import workflowitemDetailsReducer from "./pages/Workflows/WorkflowitemHistoryTab/reducer";
import loginReducer from "./pages/Login/reducer";
import documentsReducer from "./pages/Documents/reducer";
import loadingReducer from "./pages/Loading/reducer";
import userDashboardReducer from "./pages/Users/reducer";
import nodeDashboardReducer from "./pages/Nodes/reducer";
import analyticsReducer from "./pages/Analytics/reducer";
import confirmationReducer from "./pages/Confirmation/reducer";

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

/**
 * Creates the main reducer with the asynchronously loaded ones
 */
export default function createReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    route: routeReducer,
    actions: lastActionReducer,
    navbar: navbarReducer,
    overview: overviewReducer,
    detailview: subProjectReducer,
    dashboard: dashboardReducer,
    workflow: workflowReducer,
    workflowitemDetails: workflowitemDetailsReducer,
    notifications: notificationsReducer,
    login: loginReducer,
    documents: documentsReducer,
    loading: loadingReducer,
    users: userDashboardReducer,
    nodes: nodeDashboardReducer,
    analytics: analyticsReducer,
    confirmation: confirmationReducer
  });
}
