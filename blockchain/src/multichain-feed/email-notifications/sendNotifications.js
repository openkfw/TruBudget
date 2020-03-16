const logger = require("./logger");
const axios = require("axios");
const fs = require("fs");
const util = require("util");
const { createJWT } = require("./createAuthToken");

const getRecipientFromFile = async (path, file) => {
  try {
    var obj = await require(path + "/" + file);
    return obj.vout[0].items[0].data.json.recipient;
  } catch (error) {
    throw new Error(`Cannot parse json file '${path}+ "/" +${file}'\n` + error);
  }
};

function ExpiredTokenException(message) {
  this.message = message;
  this.name = "ExpiredTokenException";
}

function ConnectionRefusedException(message) {
  this.message = message;
  this.name = "ECONNREFUSED";
}

const sendNotifications = async (
  path,
  emailServiceSocketAddress,
  token,
  ssl = false,
) => {
  const readdir = util.promisify(fs.readdir);
  let files;
  try {
    files = await readdir(path);
  } catch (error) {
    return logger.error("Unable to scan directory: " + err);
  }

  for (let i = 0; i < (await files.length); i++) {
    const file = files[i];
    let recipient;
    const proto = "http";

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
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
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
        config,
      );
      if (
        response.data.notification &&
        response.data.notification.status === "sent"
      ) {
        logger.debug("Delete file " + path + "/" + file);
        await fs.unlinkSync(path + "/" + file);
      }
    } catch (error) {
      if (!error.response) {
        if (error.errno === "ECONNREFUSED") {
          throw new ConnectionRefusedException(
            `Cannot connect to ${emailServiceSocketAddress}`,
          );
        } else {
          throw error;
        }
      }
      switch (error.response.status) {
        case 400:
          // If Bearer token has expired
          throw new ExpiredTokenException("JWT-Token expired");

        case 404:
          // If no email address is found in the database delete the notification file
          if (error.response.data.notification.emailAddress === "Not Found") {
            logger.debug("Delete file " + path + "/" + file);
            await fs.unlinkSync(path + "/" + file);
          } else {
            logger.error(error);
          }
          break;

        default:
          logger.error(error);
          break;
      }
    }
  }
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
if (arguments.length !== 6) {
  logger.error("Wrong amount of arguments");
  return;
}
const [
  path,
  emailServiceSocketAddress,
  secret,
  maxPersistenceHours,
  loopIntervalSeconds,
  ssl,
] = arguments;
const absolutePath = process.cwd() + "/" + path;

let token = "";
(async () => {
  while (true) {
    try {
      // Check/Send/Delete notification transaction files in notification directory
      await sendNotifications(
        absolutePath,
        emailServiceSocketAddress,
        token,
        ssl,
      );
      await deleteFilesOlderThan(maxPersistenceHours, absolutePath);
    } catch (error) {
      // If Bearer Token expired
      if (error.name === "ExpiredTokenException") {
        token = createJWT(secret, "notification-watcher");
        logger.info("New JWT-Token created due to expiration.");
      } else {
        logger.error(error);
      }
    }
    await sleep(loopIntervalSeconds);
  }
})();
