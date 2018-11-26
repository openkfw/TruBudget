import os = require("os");
import * as pino from "pino";

// Log Parameters
const name = "TruBudget";
const hostname = os.hostname();
const pid = process.pid;
const base = { pid, hostname };
const prettyPrint =
  (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test")
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

export default logger;
