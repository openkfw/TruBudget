const log = require("./logger");

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function withRetry(cb, maxTimes = 24, timeoutMs = 30000) {
  try {
    return await cb();
  } catch (err) {
    if (maxTimes === 0) {
      const error = new Error(
        `Failed: exceeded max retries for an operation , ${err.message}`
      );
      error.code = "MAX_RETRIES";
      throw error;
    }
    if (err.status === 409) {
      // Only print error but don't stop provisioning
      // 409 - Already exists
      // 412 - Precondition error
      log.error({ err: err.data.error.message }, "The request had no effect");
    } else if (
      // Stop provisioning but retry same request
      (err.status >= 400 && err.status <= 504) ||
      (!err.response && err.code === "ECONNREFUSED") ||
      (!err.response && err.code === "ECONNABORTED") ||
      (!err.response && err.code === "ECONNRESET")
    ) {
      log.warn(
        `Server Error with status code ${err.status}, ${err.code
        }:  (${JSON.stringify(err.data)}), retry in ${timeoutMs / 1000} seconds`
      );
      await timeout(timeoutMs);
      return await withRetry(cb, --maxTimes);
    } else {
      // In case of other error codes including 500 stop provisioning immediately
      log.error({ err }, "Other Error, aborting provisioning");
      process.exit(1);
    }
  }
}

module.exports = {
  timeout,
  withRetry,
};
