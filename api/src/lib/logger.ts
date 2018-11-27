import os = require("os");
import * as pino from "pino";

// Log Parameters
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

const level = process.env.NODE_ENV === "production" ? "info" : "debug";
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

logger.debug(`PRETTY_PRINT variable: ${process.env.PRETTY_PRINT}`);
export default logger;
