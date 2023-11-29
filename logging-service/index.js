const os = require("os");
const pino = require("pino");

const logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];

const createPinoLogger = (name) => {
  // Log Parameters
  const prettyPrintOptions = ["true", "on", "1", "yes", "y"];

  const base = { hostname: os.hostname() };
  const prettyPrintInput = process.env.PRETTY_PRINT || "";
  const activatePrettyPrint = prettyPrintOptions.includes(
    prettyPrintInput.toLowerCase()
  );

  const transport = activatePrettyPrint === true ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: false,
      messageKey: "message",
      translateTime: true,
      crlf: false,
    },
  } : undefined;

  const logLevelEnvironment = process.env.LOG_LEVEL || "info";
  const level = getLevel(logLevelEnvironment);

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

  return pino({
    name,
    base,
    level,
    transport,
    redact,
    messageKey,
  });
};

const createPinoExpressLogger = (pino) => {
  const logger = require("pino-http")({
    logger: pino,
  });

  return logger;
};

const getLevel = (levelInput = "") => {
  const levelInputLowerCase = levelInput.toLowerCase();
  const level = logLevels.includes(levelInputLowerCase)
    ? levelInputLowerCase
    : undefined;

  return level;
};

module.exports = { createPinoLogger, createPinoExpressLogger };
