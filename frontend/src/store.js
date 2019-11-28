/**
 * Create the store with asynchronously loaded reducers
 */

import { createStore, applyMiddleware, compose } from "redux";
import { fromJS } from "immutable";
import { routerMiddleware } from "connected-react-router";
import createSagaMiddleware from "redux-saga";
import createDebounce from "redux-debounced";

import createReducer from "./reducers";
import rootSaga from "./sagas";
import { loadState, persistState } from "./localStorage";

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [sagaMiddleware, createDebounce(), routerMiddleware(history)];

  const enhancers = [applyMiddleware(...middlewares)];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== "production" && typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;
  /* eslint-enable */

  const persistedState = loadState();

  const store = createStore(createReducer(history), fromJS(persistedState), composeEnhancers(...enhancers));

  store.subscribe(() => {
    persistState(store.getState());
  });

  // Extensions
  sagaMiddleware.run(rootSaga);
  store.asyncReducers = {}; // Async reducer registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept("./reducers", () => {
      const createReducers = require("./reducers").default;
      const nextReducers = createReducers(store.asyncReducers);
      store.replaceReducer(nextReducers);
    });
  }

  return store;
}
