const spawn = require("child_process").spawn;

const startEmailNotificationWatcher = (path, emailServiceSocketAddress) => {
  console.log(path);
  console.log(emailServiceSocketAddress);
  const emailproc = spawn("./filterTransactions/sendData", [
    path,
    emailServiceSocketAddress,
  ]);
  emailproc.stdout.on("data", data => {
    console.log(`Notification-Watcher: ${data}`);
  });
  emailproc.stderr.on("data", data => {
    console.log(`Notification-Watcher: ${data}`);
  });

  return emailproc;
};

// startEmailNotificationWatcher("./notifications/", "localhost:8889");
// setTimeout(() => console.log("finish"), 30000);

module.exports = {
  startEmailNotificationWatcher,
};
