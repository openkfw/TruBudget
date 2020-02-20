const execFile = require("child_process").execFile;

const startEmailNotificationWatcher = (path, emailServiceSocketAddress) => {
  const emailproc = execFile(
    `${process.cwd()}/sendData`,
    [path, emailServiceSocketAddress],
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

startEmailNotificationWatcher("./notifications/", "localhost:8889");
setTimeout(() => console.log("finish"), 100000);

module.exports = {
  startEmailNotificationWatcher,
};
