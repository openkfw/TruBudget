const { createPinoLogger } = require("trubudget-logging-service");

const log = createPinoLogger("Provisioning");

module.exports = log;
