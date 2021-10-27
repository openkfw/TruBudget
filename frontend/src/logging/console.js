/* eslint-disable space-before-function-paren */
/* eslint-disable no-console */
import { createLogMsg } from "./logger";
(() => {
  const _log = console.log;
  const _error = console.error;
  const _warning = console.warning;

  console.error = function(errMessage) {
    _error.apply(console, arguments);
    createLogMsg({
      service: "FRONTEND",
      what: "Error",
      why: errMessage
    });
  };

  console.log = function(logMessage) {
    _log.apply(console, arguments);
    createLogMsg({
      service: "FRONTEND",
      what: "Log",
      why: logMessage
    });
  };

  console.warning = function(warnMessage) {
    createLogMsg({
      service: "FRONTEND",
      what: "Error",
      why: warnMessage
    });
    _warning.apply(console, arguments);
  };
})();
