import os = require("os");
import * as pino from "pino";

// Log Parameters
const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];
const name = "TruBudget";
const hostname = os.hostname();
const base = { hostname };
const prettyPrint =
  process.env.PRETTY_PRINT === "false"
    ? false
    : {
        colorize: "true",
        levelFirst: false,
        messageKey: "message",
        translateTime: true,
        crlf: false,
      };

// const level = process.env.NODE_ENV === "production" ? "info" : "debug";
const levelInput = process.env.LOG_LEVEL || "info";
const levelInputLowerCase = levelInput.toLowerCase();
const level = logLevels.indexOf(levelInputLowerCase) > -1 ? levelInputLowerCase : "info";

const redact = {
  paths: ["rpcSettings.password", "password", "*.passwordDigest", "passwordDigest"],
};
const crlf = false;
const messageKey = "message";
const useLevelLabels = true;

const logger = pino({
  name,
  base,
  level,
  prettyPrint,
  // @ts-ignore
  redact,
  useLevelLabels,
  crlf,
  messageKey,
});

export default logger;
