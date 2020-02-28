const axios = require("axios");
const fs = require("fs");

const getRecipientFromFile = async (path, file) => {
  var obj = await require(path + "/" + file);
  try {
    return obj.vout[0].items[0].data.json.recipient;
  } catch (error) {}
  throw new Error(`Cannot parse json file '${file}': \n` + error);
};

const sendData = async (path, emailServiceSocketAddress, ssl = false) => {
  fs.readdir(path, async (err, files) => {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let recipient;
      const proto = ssl ? "https" : "http";

      try {
        recipient = await getRecipientFromFile(path, file);
        console.log(recipient);
      } catch (error) {
        console.log(`Cannot parse recipient from file '${file}'`);
        continue;
      }

      try {
        await axios.post(
          `${proto}://${emailServiceSocketAddress}/notification.send`,
          {
            apiVersion: "1.0",
            data: {
              user: {
                id: recipient,
              },
            },
          },
        );
      } catch (error) {
        // If no email is found in the database delete the notification file
        if (
          error.response.status === 404 &&
          error.response.data.notification.email === "Not Found"
        ) {
          try {
            await fs.unlinkSync(path + "/" + file);
          } catch (err) {
            console.log(err);
          }
        }
      }
    }
  });
};

// Checks all files in {path} and delete them if they are older than {time}
const deleteFilesOlderThan = async (time, path) => {
  fs.readdir(path, async (err, files) => {
    if (err) {
      return console.log("Unable to scan directory: " + err);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path + "/" + file;

      fs.stat(filePath, async (err, stat) => {
        const fileAgeInHours = (Date.now() - stat.mtime) / 3.6e6;
        if (fileAgeInHours >= time) {
          try {
            await fs.unlinkSync(filePath);
          } catch (err) {
            console.log(err);
          }
        }
      });
    }
  });
};

const arguments = process.argv.slice(2);
if (arguments.length !== 4) {
  console.log("Wrong amount of arguments");
  return;
}
const [
  path,
  emailServiceSocketAddress,
  maxPersistenceHours,
  loopIntervalSeconds,
] = arguments;

while (true) {
  (async () => {
    try {
      await sendData(path, emailServiceSocketAddress);
      await deleteFilesOlderThan(maxPersistenceHours, path);
      await sleep(loopIntervalSeconds);
    } catch (error) {
      console.log(error);
    }
  })();
}
