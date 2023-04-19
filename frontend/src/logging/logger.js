import axios from "axios";
import { createLogger } from "redux-logger";

import config from "./../config";
import { store } from "./../index";

let instance = undefined;
const logMessages = [];
const getToken = () => (store ? store.getState().toJS().login.jwt : "");
const getUserId = () => (store ? store.getState().toJS().login.id : "");

const createConnection = () => {
  if (config.logging.isEnabled === false) return;
  // SSL musst be enabled when using logger in production
  if (config.envMode !== "development" && config.logging.isHostSSL === false && config.logging.isEnabled) {
    // eslint-disable-next-line no-console
    console.error(
      "Seems you are using TruBudget in production with logging enabled but without SSL! Enable SSL for Frontend-Logging to proceed!"
    );
  }
  // Build url
  instance = axios.create();
  instance.defaults.baseURL = `${config.logging.isHostSSL ? "http://" : "https://"}${config.logging.serviceHost}:${
    config.logging.servicePort
  }`;

  setInterval(pushLogToServer, 1000 * config.logging.pushInterval);
};

const setToken = () => {
  let t = getToken();
  instance.defaults.headers.common["Authorization"] = t ? `Bearer ${t}` : "";
};

const logger = createLogger({
  timestamp: true,
  logErrors: true,
  predicate: (getState, action) => predicate(getState, action),
  stateTransformer: (s) => stateTransformer(s),
  diff: true,
  errorTransformer: (error) => errorTransformer(error)
});
const stateTransformer = (s) => s;

const predicate = (getState, action) => {
  createLogMsg({
    service: "FRONTEND",
    what: "Trace",
    why: {
      action: action,
      prevState: stateTransformer(getState())
    }
  });
  //In trace mode print to console
  if (config.logging.logLevel === "trace" && config.logging.isEnabled === true) return true;
  return false;
};

const errorTransformer = (error) => {
  createLogMsg({
    service: "FRONTEND",
    what: "Error",
    why: error
  });
  return error;
};
const pushLogToServer = async () => {
  if (instance && logMessages.length > 0) {
    if (
      instance.defaults.headers.common["Authorization"] === "" ||
      instance.defaults.headers.common["Authorization"] === undefined
    )
      setToken();
    await instance.post("/api", { logMessages }).catch((ignore) => ignore);
    while (logMessages.length) {
      logMessages.pop();
    }
  }
};

export const createLogMsg = async (log) => {
  if (config.logging.isEnabled === false) return;
  const msg = {
    ...log,
    when: new Date().toString(),
    who: getUserId()
  };
  logMessages.push(msg);
};

createConnection();
export default logger;
