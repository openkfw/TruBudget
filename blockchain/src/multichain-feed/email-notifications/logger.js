const os = require("os");
const pino = require("pino");

// Log Parameters
const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];
const prettyPrintOptions = ["false", "off", "0", "no", "n"];
const name = "Notification Watcher";
const hostname = os.hostname();
const base = { hostname };
const prettyPrintInput = process.env.PRETTY_PRINT || "";
const prettyPrint = prettyPrintOptions.includes(prettyPrintInput.toLowerCase())
  ? false
  : {
      colorize: true,
      levelFirst: false,
      messageKey: "message",
      translateTime: true,
      crlf: false,
    };

const levelInput = process.env.LOG_LEVEL || "info";
const levelInputLowerCase = levelInput.toLowerCase();
const level = logLevels.includes(levelInputLowerCase)
  ? levelInputLowerCase
  : "info";

const redact = {
  paths: [
    "rpcSettings.password",
    "password",
    "*.passwordDigest",
    "passwordDigest",
  ],
};
const messageKey = "message";
const useLevelLabels = true;

const serializers = {
  error: pino.stdSerializers.err,
};

const logger = pino({
  name,
  base,
  level,
  prettyPrint,
  serializers,
  redact,
  useLevelLabels,
  messageKey,
});

module.exports = logger;
