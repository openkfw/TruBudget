// IMPORTS
import * as fs from "fs";
import "winston-daily-rotate-file";

import os = require("os");
import * as pino from "pino";
const pinoms = require("pino-multi-stream");
const childProcess = require("child_process");
const stream = require("stream");
const { createLogger, format, transports } = require("winston");
// const { combine, timestamp, label, prettyPrint, colorize } = format;

// Log Parameters
const name = "TruBudget";
const hostname = os.hostname();
const pid = process.pid;
const base = { pid, hostname };
const prettyPrint = false; // process.env.NODE_ENV === "production" ? false : true;
const level = "debug"; // process.env.NODE_ENV === "production" ? "info" : "debug";
const redact = {
  paths: ["rpcSettings.password", "password", "*.passwordDigest", "passwordDigest"],
};
const crlf = true;
const messageKey = "PINOmessage";
const useLevelLabels = true;

const cwd = process.cwd();
const { env } = process;
// Creation of log dir
const logDir = "./log/";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const streams = [
  { level: "debug", stream: process.stdout },
  { stream: fs.createWriteStream(logDir + "server.log") },
  // { level: "debug", stream: fs.createWriteStream(logDir + "debug.log") },
  // { level: "info", stream: fs.createWriteStream(logDir + "info.log") },
  // { level: "warn", stream: fs.createWriteStream(logDir + "warn.log") },
  // { level: "error", stream: fs.createWriteStream(logDir + "error.log") },
];

// const logger = pino({
//   name,
//   base,
//   level,
//   // prettyPrint,
//   // @ts-ignore
//   redact,
//   useLevelLabels,
//   crlf,
//   messageKey,
//   },
// );

const logger = pinoms({
  name,
  base,
  level,
  // @ts-ignore
  redact,
  useLevelLabels,
  crlf,
  messageKey,
  streams,
});

// const child = childProcess.spawn(process.execPath, [
//   require.resolve('pino-tee'),
//   "warn", `${logDir}/warn.log`,
//   "error", `${logDir}/error.log`,
//   "fatal", `${logDir}/fatal.log`,
//   "debug", `${logDir}/debug.log`,
// ], {cwd, env});

// logThrough.pipe(child.stdin);
// logThrough.pipe(process.stdout);
// Transport for log rotation
// This creates new log files each hour, keeps them 14 days and splits them into chunks of 20mb
// const transport = new transports.DailyRotateFile({
//   filename: logDir + "application-%DATE%.log",
//   datePattern: "YYYY-MM-DD-HH",
//   zippedArchive: false,
//   maxSize: "20m",
//   maxFiles: "14d",
// });

// const pinoLevels = {
//   levels: {
//     "fatal": 0,
//     "error": 1,
//     "warn": 2,
//     "info": 3,
//     "debug": 4,
//     "trace": 5,
//     "child": 6,
//     "query": 7,
//   },
// };
// 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or silent.
// const logger = createLogger({
//   // format: combine(label({ label: "API" }), timestamp(), prettyPrint()),
//   level: "info",
//   levels: pinoLevels.levels,
//   transports: [
//     transport,
//     new transports.File({ filename: logDir + "combined.log" }),
//     new transports.Console(),
//   ],
// });

// process.stdout.pipe(winLogger);

export default logger;
