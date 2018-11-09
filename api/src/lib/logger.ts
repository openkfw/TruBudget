import os = require("os");
import * as pino from "pino";

const name = "TruBudget";
const hostname = os.hostname();
const pid = process.pid;
const base = { pid, hostname };
const prettyPrint = true; // process.env.NODE_ENV === "production" ? false : true;
const level = "debug"; // process.env.NODE_ENV === "production" ? "info" : "debug";
const redact = {
  paths: ["password", "passwordDigest"],
};
const crlf = true;
const messageKey = "msg";
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
