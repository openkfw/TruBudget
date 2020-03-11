const fork = require("child_process").fork;
const fs = require("fs");

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
    console.log("Folder 'notifications' created");
  }
  console.log("Starting email notification watcher process...");
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
