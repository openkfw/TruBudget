"use strict";
exports.__esModule = true;
var os = require("os");
var pino = require("pino");
// Log Parameters
var logLevels = ["trace", "debug", "info", "warn", "error", "fatal"];
var prettyPrintOptions = ["false", "off", "0", "no", "n"];
var name = "TruBudget";
var hostname = os.hostname();
var base = { hostname: hostname };
var prettyPrintInput = process.env.PRETTY_PRINT || "";
var prettyPrint = prettyPrintOptions.includes(prettyPrintInput.toLowerCase())
    ? false
    : {
        colorize: true,
        levelFirst: false,
        messageKey: "message",
        translateTime: true,
        crlf: false
    };
var levelInput = process.env.LOG_LEVEL || "info";
var levelInputLowerCase = levelInput.toLowerCase();
var level = logLevels.includes(levelInputLowerCase) ? levelInputLowerCase : "info";
var redact = {
    paths: ["rpcSettings.password", "password", "*.passwordDigest", "passwordDigest"]
};
var messageKey = "message";
var useLevelLabels = true;
var serializers = {
    error: pino.stdSerializers.err
};
var logger = pino({
    name: name,
    base: base,
    level: level,
    prettyPrint: prettyPrint,
    serializers: serializers,
    // @ts-ignore
    redact: redact,
    useLevelLabels: useLevelLabels,
    messageKey: messageKey
});
exports["default"] = logger;
