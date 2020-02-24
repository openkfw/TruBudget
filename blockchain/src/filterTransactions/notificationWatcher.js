const execFile = require("child_process").execFile;

const startEmailNotificationWatcher = (
  path,
  emailServiceSocketAddress,
  maxPersistenceTime,
) => {
  const emailproc = execFile(
    // TODO: Find better way to find path to sendData file
    `${process.cwd()}/src/filterTransactions/sendData`,
    [path, emailServiceSocketAddress, maxPersistenceTime],
    (error, stdout, stderr) => {
      if (error) {
        console.log(error);
      }
      console.log(stdout);
    },
  );
  emailproc.stdout.on("data", data => {
    console.log(`Notification-Watcher: ${data}`);
  });
  emailproc.stderr.on("data", data => {
    console.log(`Notification-Watcher: ${data}`);
  });

  return emailproc;
};

// startEmailNotificationWatcher("./notifications/", "localhost:8889", 24);
// setTimeout(() => console.log("finish"), 10000);

module.exports = {
  startEmailNotificationWatcher,
};
