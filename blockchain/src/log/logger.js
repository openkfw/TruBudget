const { createPinoLogger } = require("trubudget-logging-service");

const logger = createPinoLogger("Trubudget-Blockchain");

module.exports = logger;
