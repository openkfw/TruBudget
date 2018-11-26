import os = require("os");
import * as pino from "pino";

// Log Parameters
const name = "TruBudget";
const hostname = os.hostname();
const pid = process.pid;
const base = { pid, hostname };
const prettyPrint = {
  colorize: "true",
  levelFirst: false,
  messageKey: "message",
  translateTime: true,
  crlf: true,
}; // process.env.NODE_ENV === "production" ? false : true;
const level = "debug"; // process.env.NODE_ENV === "production" ? "info" : "debug";
const redact = {
  paths: ["rpcSettings.password", "password", "*.passwordDigest", "passwordDigest"],
};
const crlf = false;
const messageKey = "PINOmessage";
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

// const logger = pinoms({
//   name,
//   base,
//   level,
//   // @ts-ignore
//   redact,
//   useLevelLabels,
//   crlf,
//   messageKey,
//   streams,
// });

export default logger;
