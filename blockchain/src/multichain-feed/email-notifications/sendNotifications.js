const logger = require("./logger");
const axios = require("axios");
const fs = require("fs");

const getRecipientFromFile = async (path, file) => {
  try {
    var obj = await require(path + "/" + file);
    return obj.vout[0].items[0].data.json.recipient;
  } catch (error) {
    throw new Error(`Cannot parse json file '${path}+ "/" +${file}'\n` + error);
  }
};

const sendNotifications = async (
  path,
  emailServiceSocketAddress,
  ssl = false,
) => {
  fs.readdir(path, async (err, files) => {
    if (err) {
      return logger.error("Unable to scan directory: " + err);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let recipient;
      const proto = ssl ? "https" : "http";

      try {
        recipient = await getRecipientFromFile(path, file);
        logger.debug(`Recipient of file ${path}/${file}: ${recipient}`);
      } catch (error) {
        logger.error(error);
        continue;
      }

      try {
        logger.debug(
          `Sending post request to ${proto}://${emailServiceSocketAddress}/notification.send with recipient ${recipient}`,
        );
        const response = await axios.post(
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
        if (
          response.data.notification &&
          response.data.notification.status === "sent"
        ) {
          logger.debug("Delete file " + path + "/" + file);
          await fs.unlinkSync(path + "/" + file);
        }
      } catch (error) {
        // If no email is found in the database delete the notification file
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data.notification.email === "Not Found"
        ) {
          try {
            logger.debug("Delete file " + path + "/" + file);
            await fs.unlinkSync(path + "/" + file);
          } catch (err) {
            logger.error(err);
          }
        } else {
          if (error.errno === "ECONNREFUSED") {
            logger.error(`Cannot connect to ${emailServiceSocketAddress} `);
          } else {
            logger.error(error);
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
      return logger.error("Unable to scan directory: " + err);
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path + "/" + file;

      fs.stat(filePath, async (err, stat) => {
        const fileAgeInHours = (Date.now() - stat.mtime) / 3.6e6;
        if (fileAgeInHours >= time) {
          try {
            logger.debug("Delete file " + filePath);
            await fs.unlinkSync(filePath);
          } catch (err) {
            logger.error(err);
          }
        }
      });
    }
  });
};

function sleep(s) {
  return new Promise(resolve => {
    setTimeout(resolve, s * 1000);
  });
}

const arguments = process.argv.slice(2);
logger.debug(
  `${process.argv[0]} is executed with following arguments: ${arguments}`,
);
if (arguments.length !== 4) {
  logger.error("Wrong amount of arguments");
  return;
}
const [
  path,
  emailServiceSocketAddress,
  maxPersistenceHours,
  loopIntervalSeconds,
] = arguments;
const absolutePath = process.cwd() + "/" + path;

(async () => {
  while (true) {
    try {
      // Check/Send/Delete notification transaction files in notification directory
      await sendNotifications(absolutePath, emailServiceSocketAddress);
      await deleteFilesOlderThan(maxPersistenceHours, absolutePath);
      await sleep(loopIntervalSeconds);
    } catch (error) {
      logger.error(error);
    }
  }
})();
