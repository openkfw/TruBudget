const fork = require("child_process").fork;
const fs = require("fs");

const log = require("./../../log/logger");

const startEmailNotificationWatcher = (
  path,
  emailServiceSocketAddress,
  secret,
  maxPersistenceHours = 24,
  loopIntervalSeconds = 10,
  ssl = false,
) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    log.info("Folder 'notifications' created");
  }
  log.info("Starting email notification watcher process");
  const emailproc = fork(
    `${__dirname}/sendNotifications.js`,
    [
      path,
      emailServiceSocketAddress,
      secret,
      maxPersistenceHours,
      loopIntervalSeconds,
      ssl,
    ],
    {},
  );

  return emailproc;
};

module.exports = {
  startEmailNotificationWatcher,
};
