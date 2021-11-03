import axios from "axios";
import { createLogger } from "redux-logger";
import { store } from "./../index";
const {
  NODE_ENV,
  REACT_APP_LOGGING,
  REACT_APP_LOG_LEVEL,
  REACT_APP_LOGGING_SERVICE_HOST,
  REACT_APP_LOGGING_SERVICE_PORT,
  REACT_APP_LOGGING_SERVICE_HOST_SSL,
  REACT_APP_LOGGING_PUSH_INTERVAL
} = process.env;

let instance = undefined;
const logMessages = [];
const getToken = () => (store ? store.getState().toJS().login.jwt : "");
const getUserId = () => (store ? store.getState().toJS().login.id : "");

const createConnection = () => {
  if (REACT_APP_LOGGING === false) return;
  // SSL musst be enabled when using logger in production
  if (NODE_ENV !== "developement" && REACT_APP_LOGGING_SERVICE_HOST_SSL === "false" && REACT_APP_LOGGING === "true") {
    // eslint-disable-next-line no-console
    console.error(
      "Seems you are using TruBudget in production with logging enabled but without SSL! Enable SSL for Frontend-Logging to proceed!"
    );
  }
  // Build url
  instance = axios.create();
  instance.defaults.baseURL = `${
    REACT_APP_LOGGING_SERVICE_HOST_SSL ? "http://" : "https://"
  }${REACT_APP_LOGGING_SERVICE_HOST}:${REACT_APP_LOGGING_SERVICE_PORT}`;

  setInterval(pushLogToServer, 1000 * REACT_APP_LOGGING_PUSH_INTERVAL);
};

const setToken = () => {
  let t = getToken();
  instance.defaults.headers.common["Authorization"] = t ? `Bearer ${t}` : "";
};

const logger = createLogger({
  timestamp: true,
  logErrors: true,
  predicate: (getState, action) => predicate(getState, action),
  stateTransformer: s => stateTransformer(s),
  diff: true,
  errorTransformer: error => errorTransformer(error)
});
const stateTransformer = s => s;

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
  if (REACT_APP_LOG_LEVEL === "trace" && REACT_APP_LOGGING === "true") return true;
  return false;
};

const errorTransformer = error => {
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
    await instance.post("/api", { logMessages }).catch(ignore => ignore);
    while (logMessages.length) {
      logMessages.pop();
    }
  }
};

export const createLogMsg = async log => {
  if (REACT_APP_LOGGING === "false") return;
  const msg = {
    ...log,
    when: new Date().toString(),
    who: getUserId()
  };
  logMessages.push(msg);
};

createConnection();
export default logger;
