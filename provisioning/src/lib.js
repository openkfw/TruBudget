function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function withRetry(cb, maxTimes = 12, timeoutMs = 10000) {
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
      (!err.response && err.code === "ECONNREFUSED") ||
      (!err.response && err.code === "ECONNABORTED")
    ) {
      console.log(
        `Internal Server Error (${err.message}), retry in ${timeoutMs /
          1000} seconds`
      );
      await timeout(timeoutMs);
      return await withRetry(cb, --maxTimes);
    } else if (err.response && err.response.status === 409) {
      console.log("The item you tried to create already exists");
    } else {
      // console.log(err);
      throw new Error(`Something strange happend ${err}`);
    }
  }
}

module.exports = {
  timeout,
  withRetry
};
