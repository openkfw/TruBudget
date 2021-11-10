const multiChainDebugParameter =
  "-debug=mcapi,mchn,mccoin,mcatxo,mcminer,mcblock";

const printToConsole = "-printtoconsole";

const includeLoggingParamsToArgs = (args) => {
  const logLevel = (process.env.LOG_LEVEL || "").toLowerCase();

  if (logLevel !== "debug" && logLevel !== "trace") {
    return [...args];
  }

  if (args.includes(printToConsole)) {
    return [...args, multiChainDebugParameter];
  }

  return [...args, multiChainDebugParameter, printToConsole];
};

module.exports = includeLoggingParamsToArgs;
