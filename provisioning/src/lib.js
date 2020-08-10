function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function withRetry(cb, maxTimes = 24, timeoutMs = 20000) {
  try {
    return await cb();
  } catch (err) {
    if (maxTimes === 0) {
      const error = new Error(
        "Failed: exceeded max retries for an operation , ${err.message}"
      );
      error.code = "MAX_RETRIES";
      throw error;
    }
    if (err.status === 409) {
      // Only print error but don't stop provisioning
      // 409 - Already exists
      // 412 - Precondition error
      console.log(`The request had no effect: `, err.data.error.message);
    } else if (
      // Stop provisioning but retry same request
      (err.status >= 400 && err.status < 500) ||
      (!err.response && err.code === "ECONNREFUSED") ||
      (!err.response && err.code === "ECONNABORTED")
    ) {
      console.log(
        `Server Error with status code ${err.status} (${
          err.data.error.message
        }), retry in ${timeoutMs / 1000} seconds`
      );
      await timeout(timeoutMs);
      return await withRetry(cb, --maxTimes);
    } else {
      // In case of other error codes including 500 stop provisioning immediatly
      console.error(err.data);
      process.exit(1);
    }
  }
}

module.exports = {
  timeout,
  withRetry,
};
