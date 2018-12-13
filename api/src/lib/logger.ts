import os = require("os");
import * as pino from "pino";

// Log Parameters
const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];
const name = "TruBudget";
const hostname = os.hostname();
const base = { hostname };
const prettyPrintInput = process.env.PRETTY_PRINT || "";
const prettyPrint =
  prettyPrintInput.toLowerCase() in ["false", "off", "0", "no", "n"]
    ? false
    : {
        colorize: "true",
        levelFirst: false,
        messageKey: "message",
        translateTime: true,
        crlf: false,
      };

const levelInput = process.env.LOG_LEVEL || "info";
const levelInputLowerCase = levelInput.toLowerCase();
const level = logLevels.includes(levelInputLowerCase) ? levelInputLowerCase : "info";

const redact = {
  paths: ["rpcSettings.password", "password", "*.passwordDigest", "passwordDigest"],
};
const crlf = false;
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
  // @ts-ignore
  redact,
  useLevelLabels,
  crlf,
  messageKey,
});

export default logger;
