const fork = require("child_process").fork;

const startEmailNotificationWatcher = (
  path,
  emailServiceSocketAddress,
  maxPersistenceHours,
  loopIntervalSeconds,
) => {
  const emailproc = fork(
    "./sendData.js", // `${process.cwd()}/src/multichain-feed/sendData.js`,
    [path, emailServiceSocketAddress, maxPersistenceHours, loopIntervalSeconds],
    { silent: true },
  );
  emailproc.stdout.on("data", data => {
    console.log(`Notification-Watcher: ${data}`);
  });
  emailproc.stderr.on("data", data => {
    console.log(`Notification-Watcher: ${data}`);
  });

  return emailproc;
};

startEmailNotificationWatcher("./notifications/", "localhost:8890", 24, 10);
setTimeout(() => console.log("finish"), 100000);

module.exports = {
  startEmailNotificationWatcher,
};
