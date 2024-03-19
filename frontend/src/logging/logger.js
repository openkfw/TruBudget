import axios from "axios";
import { Iterable } from "immutable";

import config from "./../config";

let instance = undefined;
const logMessages = [];
const getToken = (state) => stateTransformer(state)?.login?.jwt || "";
const getUserId = (state) => stateTransformer(state)?.login?.id || "";

export const createLogMsg = (state, log) => {
  if (config.logging.isEnabled === false) return;
  const msg = {
    ...log,
    when: new Date().toString(),
    who: getUserId(state),
    token: getToken(state)
  };
  logMessages.push(msg);
};

const pushLogToServer = async () => {
  if (instance && logMessages.length > 0) {
    const messages = logMessages.map(({ ...rest }) => rest).filter((m) => m.service !== undefined);
    await instance.post("/api", { logMessages: messages }).catch((ignore) => ignore);
    while (logMessages.length) {
      logMessages.pop();
    }
  }
};

const createConnection = () => {
  if (config.logging.isEnabled === false) return false;
  // SSL musst be enabled when using logger in production
  if (config.envMode !== "development" && config.logging.isHostSSL === false && config.logging.isEnabled) {
    // eslint-disable-next-line no-console
    console.error(
      "Seems you are using TruBudget in production with logging enabled but without SSL! Enable SSL for Frontend-Logging to proceed!"
    );
  }
  // Build url
  instance = axios.create();
  instance.defaults.baseURL = `${config.logging.isHostSSL ? "https://" : "http://"}${config.logging.serviceHost}:${
    config.logging.servicePort
  }`;

  setInterval(pushLogToServer, 1000 * config.logging.pushInterval);

  return true;
};

const stateTransformer = (state) => {
  if (Iterable.isIterable(state)) return state.toJS();
  else return state;
};

const predicate = (getState, action) => {
  const state = getState();
  createLogMsg(state, {
    service: "FRONTEND",
    what: "Trace",
    why: {
      action: action,
      prevState: stateTransformer(state)
    }
  });
  //In trace mode print to console
  if (config.logging.logLevel === "trace" && config.logging.isEnabled === true) return true;
  return false;
};

const errorTransformer = (getState, error) => {
  const state = getState();
  createLogMsg(state, {
    service: "FRONTEND",
    what: "Error",
    why: error
  });
  return error;
};

const loggerOptions = {
  timestamp: true,
  logErrors: true,
  predicate: (getState, action) => predicate(getState, action),
  stateTransformer: (s) => stateTransformer(s),
  diff: true,
  errorTransformer: (getState, error) => errorTransformer(getState, error)
};

// eslint-disable-next-line no-unused-vars
const isLoggingConnected = createConnection();

export default loggerOptions;
