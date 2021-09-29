const os = require("os");
const pino = require("pino");

const createPinoLogger = (name) => {
  // Log Parameters
  const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];
  const prettyPrintOptions = ["false", "off", "0", "no", "n"];

  const base = { hostname: os.hostname() };
  const prettyPrintInput = process.env.PRETTY_PRINT || "";
  const prettyPrint = prettyPrintOptions.includes(
    prettyPrintInput.toLowerCase()
  )
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
      "*.password",
      "password.*",
    ],
  };
  const messageKey = "message";
  const formatters = {
    level: (label) => {
      return { level: label };
    },
  };

  return pino({
    name,
    base,
    level,
    prettyPrint,
    redact,
    messageKey,
    formatters,
  });
};

const createPinoExpressLogger = (pino) => {
  const logger = require("pino-http")({
    logger: pino,
  });

  return logger;
};

module.exports = { createPinoLogger, createPinoExpressLogger };
