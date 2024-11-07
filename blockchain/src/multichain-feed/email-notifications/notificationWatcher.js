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
  algorithm = "HS256",
) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    log.info("Folder 'notifications' created");
  }
  log.info("Starting email notification watcher process");
  const emailproc = fork(
    `${__dirname}/sendNotifications.js`,
    [path, emailServiceSocketAddress, secret, maxPersistenceHours, loopIntervalSeconds, ssl, algorithm],
    {},
  );

  emailproc.on("exit", (code, signal) => {
    if (signal) {
      log.error(`Email notification watcher process was killed by signal: ${signal}`);
    } else if (code !== null) {
      log.error(`Email notification watcher process exited with code: ${code}`);
    } else {
      log.error("Email notification watcher process exited");
    }
  });

  return emailproc;
};

module.exports = {
  startEmailNotificationWatcher,
};
