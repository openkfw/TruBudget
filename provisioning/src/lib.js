function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
    if (
      (err.response && err.response.status === 500) ||
      (err.response && err.response.status === 500) ||
      (err.response && err.response.status === 404) ||
      (err.response && err.response.status === 400) ||
      (!err.response && err.code === "ECONNREFUSED") ||
      (!err.response && err.code === "ECONNABORTED")
    ) {
      console.log(
        `Server Error (${err.message}), retry in ${timeoutMs / 1000} seconds`
      );
      await timeout(timeoutMs);
      return await withRetry(cb, --maxTimes);
    } else if (
      err.response &&
      err.response.status >= 400 &&
      err.response.status < 500
    ) {
      console.log(
        `The request had no effect: a precondition was not fulfilled:`,
        err.response.data
      );
    } else {
      console.error(err);
      process.exit(1);
    }
  }
}

module.exports = {
  timeout,
  withRetry
};
