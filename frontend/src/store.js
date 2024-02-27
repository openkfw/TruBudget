/**
 * Create the store with asynchronously loaded reducers
 */
import { configureStore } from "@reduxjs/toolkit";
import { fromJS } from "immutable";
import createDebounce from "redux-debounced";
import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";

import loggerOptions from "./logging/logger";
import { loadFromLocalStorage, saveToLocalStorage } from "./localStorage";
import rootReducer, { createReduxHistory, routerMiddleware } from "./reducers";
import rootSaga from "./sagas";

const sagaMiddleware = createSagaMiddleware();

function configureTBStore() {
  // Create the store with four middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  // 3. redux-debounced
  // 4. redux-logger with custom options

  const persistedState = loadFromLocalStorage();

  const store = configureStore({
    reducer: rootReducer,
    preloadedState: fromJS(persistedState),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false
      }).concat(routerMiddleware, sagaMiddleware, createDebounce(), createLogger(loggerOptions))
  });

  store.subscribe(() => {
    saveToLocalStorage(store.getState());
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

export const store = configureTBStore();

export const history = createReduxHistory(store);
