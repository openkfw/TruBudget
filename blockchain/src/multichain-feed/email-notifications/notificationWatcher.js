const fork = require("child_process").fork;
var fs = require("fs");

const startEmailNotificationWatcher = (
  path,
  emailServiceSocketAddress,
  token,
  maxPersistenceHours = 24,
  loopIntervalSeconds = 10,
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
      maxPersistenceHours,
      loopIntervalSeconds,
      token,
    ],
    {},
  );

  return emailproc;
};

module.exports = {
  startEmailNotificationWatcher,
};
