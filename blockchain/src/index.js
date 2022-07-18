const express = require("express");
const bodyParser = require("body-parser");
const tar = require("tar-fs");
const rawTar = require("tar-stream");
const fs = require("fs");
const streamifier = require("streamifier");
const yaml = require("js-yaml");
const k8s = require("@kubernetes/client-node");
const os = require("os");
const KubernetesClient = require("./kubernetesClient");
const log = require("./log/logger");
const logService = require("trubudget-logging-service");
const { version } = require("../package.json");

const {
  startEmailNotificationWatcher,
} = require("./multichain-feed/email-notifications/notificationWatcher");
const { startBeta, registerNodeAtAlpha } = require("./connectToChain");
const { startMultichainDaemon, configureChain } = require("./createChain");
const { isMultichainReady } = require("./readiness");

const {
  moveBackup,
  verifyHashSha256,
  removeFile,
  createMetadataFileSha256,
} = require("./shell");

const app = express();
const port = process.env.PORT || 8085;

const ORGANIZATION = process.env.ORGANIZATION || "MyOrga";
const CHAINNAME = "TrubudgetChain";
const MULTICHAIN_RPC_PORT = process.env.MULTICHAIN_RPC_PORT || 8000;
const MULTICHAIN_RPC_USER = process.env.MULTICHAIN_RPC_USER || "multichainrpc";
const MULTICHAIN_RPC_PASSWORD =
  process.env.MULTICHAIN_RPC_PASSWORD ||
  "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j";
const RPC_ALLOW_IP = process.env.RPC_ALLOW_IP || "0.0.0.0/0";
const CERT_PATH = process.env.CERT_PATH || undefined;
const CERT_CA_PATH = process.env.CERT_CA_PATH || undefined;
const CERT_KEY_PATH = process.env.CERT_KEY_PATH || undefined;

let autostart = true;
let isRunning = true;

const EXTERNAL_IP = process.env.EXTERNAL_IP;
const P2P_HOST = process.env.P2P_HOST;
const P2P_PORT = process.env.P2P_PORT || 7447;

const API_PROTO = process.env.API_PROTO || "http";
const API_HOST = process.env.API_HOST || "localhost";
const API_PORT = process.env.API_PORT || "8080";
const MULTICHAIN_DIR = process.env.MULTICHAIN_DIR || "/root";

// Email Service
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_SSL = process.env.EMAIL_SSL || false;
const NOTIFICATION_PATH = process.env.NOTIFICATION_PATH || "./notifications/";
const NOTIFICATION_MAX_LIFETIME = process.env.NOTIFICATION_MAX_LIFETIME || 24;
const NOTIFICATION_SEND_INTERVAL = process.env.NOTIFICATION_SEND_INTERVAL || 10;
const emailAuthSecret = process.env.JWT_SECRET;

const EMAIL_SERVICE_ENABLED =
  process.env.EMAIL_SERVICE_ENABLED === "true" ? true : false;
const MULTICHAIN_FEED_ENABLED =
  process.env.MULTICHAIN_FEED_ENABLED === "true" ? true : false;
const isMultichainFeedEnabled =
  EMAIL_SERVICE_ENABLED || MULTICHAIN_FEED_ENABLED;

const connectArg = `${CHAINNAME}@${P2P_HOST}:${P2P_PORT}`;

const multichainDir = `${MULTICHAIN_DIR}/.multichain`;
const isAlpha = P2P_HOST ? false : true;
const blockNotifyArg = process.env.BLOCKNOTIFY_SCRIPT
  ? `-blocknotify=${blockNotifyArg}`
  : "";

const SERVICE_NAME = process.env.KUBE_SERVICE_NAME || "";
const NAMESPACE = process.env.KUBE_NAMESPACE || "";
const EXPOSE_MC = process.env.EXPOSE_MC === "true" ? true : false;

const isEmailConfigured = EMAIL_HOST && EMAIL_PORT && emailAuthSecret;

if (EMAIL_SERVICE_ENABLED && !isEmailConfigured) {
  if (!EMAIL_HOST) {
    log.fatal(
      "Env variable EMAIL_HOST is not set. Either set this variable or set EMAIL_SERVICE_ENABLED to false",
    );
  }
  if (!EMAIL_PORT) {
    log.fatal(
      "Env variable EMAIL_PORT is not set. Either set this variable or set EMAIL_SERVICE_ENABLED to false",
    );
  }
  if (!emailAuthSecret) {
    log.fatal(
      "Env variable JWT_SECRET is not set. Either set this variable or set EMAIL_SERVICE_ENABLED to false",
    );
  }
  log.fatal("Incorrectly set env vars, exiting ...");
  process.exit(1);
}

app.use(logService.createPinoExpressLogger(log));

app.use(
  bodyParser.raw({
    type: "application/gzip",
    limit: "1024mb",
  }),
  bodyParser.json({
    type: "application/json",
    limit: "100mb",
  }),
);

let mcproc;

const spawnProcess = (startProcess) => {
  mcproc = startProcess();
  isRunning = true;
  mcproc.on("close", async (code, signal) => {
    isRunning = false;
    if (!autostart) {
      log.info(
        `multichaind stopped with exit code ${code} and signal ${signal}. Autorestart is disabled`,
      );
    } else {
      const retryIntervalMs = 10000;
      log.info(
        `Multichain stopped with exit code ${code} and signal ${signal}. Retry in ${
          retryIntervalMs / 1000
        } Seconds...`,
      );
      await new Promise((resolve) => {
        setTimeout(resolve, retryIntervalMs);
      });
      spawnProcess(startProcess);
    }
  });
};

configureChain(
  isAlpha,
  CHAINNAME,
  multichainDir,
  MULTICHAIN_RPC_PORT,
  MULTICHAIN_RPC_USER,
  MULTICHAIN_RPC_PASSWORD,
  RPC_ALLOW_IP,
  isMultichainFeedEnabled,
);

function initMultichain() {
  if (isAlpha) {
    spawnProcess(() =>
      startMultichainDaemon(
        CHAINNAME,
        externalIpArg,
        blockNotifyArg,
        P2P_PORT,
        multichainDir,
      ),
    );
  } else {
    spawnProcess(() =>
      startBeta(
        CHAINNAME,
        API_PROTO,
        API_HOST,
        API_PORT,
        P2P_PORT,
        connectArg,
        blockNotifyArg,
        externalIpArg,
        multichainDir,
      ),
    );
    setTimeout(
      () =>
        registerNodeAtAlpha(
          ORGANIZATION,
          API_PROTO,
          API_HOST,
          API_PORT,
          CERT_PATH,
          CERT_CA_PATH,
          CERT_KEY_PATH,
        ),
      5000,
    );
  }
}

let externalIpArg =
  process.env.EXTERNAL_IP && process.env.EXTERNAL_IP !== ""
    ? `-externalip=${EXTERNAL_IP}`
    : "";

if (EXPOSE_MC) {
  const kc = new k8s.KubeConfig();

  if (fs.existsSync(os.homedir() + "/.kube/config") /* ? */) {
    kc.loadFromDefault();
  } else {
    kc.loadFromCluster();
  }

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const kubernetesClient = new KubernetesClient(k8sApi);

  kubernetesClient.getServiceIp(SERVICE_NAME, NAMESPACE).then((response) => {
    log.info(`externalIp: ${response}`);
    if (response) {
      externalIpArg = `-externalip=${response}`;
    }

    initMultichain();
    if (EMAIL_SERVICE_ENABLED) {
      startEmailNotificationWatcher(
        NOTIFICATION_PATH,
        `${EMAIL_HOST}:${EMAIL_PORT}`,
        emailAuthSecret,
        NOTIFICATION_MAX_LIFETIME,
        NOTIFICATION_SEND_INTERVAL,
        EMAIL_SSL,
      );
    }
  });
} else {
  initMultichain();
  if (EMAIL_SERVICE_ENABLED) {
    startEmailNotificationWatcher(
      NOTIFICATION_PATH,
      `${EMAIL_HOST}:${EMAIL_PORT}`,
      emailAuthSecret,
      NOTIFICATION_MAX_LIFETIME,
      NOTIFICATION_SEND_INTERVAL,
      EMAIL_SSL,
    );
  }
}

const stopMultichain = async (mcproc) => {
  while (isRunning) {
    mcproc.kill();
    const retryInMs = 3000;
    await new Promise((resolve) => {
      setTimeout(resolve, retryInMs);
    });
  }
  log.info("Multichain process killed");
};

app.get("/chain-sha256", async (req, res) => {
  try {
    log.info("Start packaging");
    autostart = false;
    await stopMultichain(mcproc);
    await createMetadataFileSha256(CHAINNAME, multichainDir, ORGANIZATION);
    res.setHeader("Content-Type", "application/gzip");
    res.setHeader(
      "Content-Disposition",
      ` attachment; filename="${CHAINNAME}.gz"`,
    );
    tar
      .pack(`${multichainDir}/${CHAINNAME}`, {
        finish: () => {
          log.info("Restarting multichain");
          spawnProcess(() =>
            startMultichainDaemon(
              CHAINNAME,
              externalIpArg,
              blockNotifyArg,
              P2P_PORT,
              multichainDir,
            ),
          );
          autostart = true;
        },
      })
      .pipe(res);
  } catch (err) {
    log.error({ err }, "Error while packaging");
    res.status(500).send("INTERNAL SERVER ERROR");
  }
});

app.get("/version", (req, res) => {
  const content = {
    release: process.env.npm_package_version,
    commit: process.env.CI_COMMIT_SHA,
    buildTimeStamp: process.env.BUILDTIMESTAMP,
  };
  res.send(content);
});

app.get("/liveness", (req, res) => {
  res
    .status(200)
    .header({ "Content-Type": "application/json" })
    .send(
      JSON.stringify({
        uptime: process.uptime(),
      }),
    );
});

app.get("/readiness", (req, res) => {
  const isReady = isMultichainReady(CHAINNAME);
  if (isReady && isRunning) {
    res
      .status(200)
      .header({ "Content-Type": "application/json" })
      .send("Ready");
  } else if (!isReady && isRunning) {
    res
      .status(504)
      .header({ "Content-Type": "application/json" })
      .send("Not ready. Multichain is starting ...");
  } else {
    res
      .status(504)
      .header({ "Content-Type": "application/json" })
      .send("Not ready. Multichain process stopped");
  }
});

const loadConfig = (path) => {
  const config = yaml.load(fs.readFileSync(path, "utf8"));
  removeFile(path);
  return config;
};

app.post("/chain", async (req, res) => {
  const extractPath = `/tmp/backup${Date.now()}`;
  const metadataPath = `${extractPath}/metadata.yml`;
  const chainConfigPath = `${extractPath}/multichain.conf`;
  try {
    const unTARer = rawTar.extract();
    unTARer.on("error", (err) => {
      log.error({ err }, "Error while extracting rawTar: ");
      unTARer.destroy();
      res.status(400).send(err.message);
    });
    const extract = tar.extract(extractPath, { extract: unTARer });
    const file = streamifier.createReadStream(req.body);
    const stream = file.pipe(extract);
    stream.on("finish", async () => {
      if (fs.existsSync(metadataPath)) {
        const config = loadConfig(metadataPath);
        const validSha256 = await verifyHashSha256(
          config.DirectoryHash,
          extractPath,
        );
        const chainConfig = yaml.load(fs.readFileSync(chainConfigPath, "utf8"));
        let correctConfig = chainConfig.includes(MULTICHAIN_RPC_PASSWORD);

        if (config.hasOwnProperty("Organisation")) {
          const correctOrg = config.Organisation === ORGANIZATION;
          correctConfig = correctConfig && correctOrg;
        }
        //Check for major version compatibility
        const compatibleVersions =
          config.hasOwnProperty("Version") &&
          config.Version.split(".")[0] === version.split(".")[0];

        if (correctConfig && compatibleVersions) {
          if (validSha256) {
            autostart = false;
            await stopMultichain(mcproc);
            await moveBackup(multichainDir, extractPath, CHAINNAME);
            spawnProcess(() =>
              startMultichainDaemon(
                CHAINNAME,
                externalIpArg,
                blockNotifyArg,
                P2P_PORT,
                multichainDir,
              ),
            );
            autostart = true;
            res.send("OK");
          } else {
            log.warn("Request did not contain a valid trubudget backup");
            if (!compatibleVersions) {
              log.warn(
                "The uploaded backup is not compatible with this version of TruBudget",
              );
            }
            res.status(400).send("Not a valid TruBudget backup");
          }
        } else {
          if (!compatibleVersions) {
            log.warn(
              "The uploaded backup is not compatible with this version of TruBudget",
            );
          }
          log.warn("Tried to Backup with invalid configuration");
          res
            .status(400)
            .send("Backup with these configurations is not permitted");
        }
      } else {
        res.status(400).send("Metadata not available");
      }
    });
  } catch (err) {
    log.error({ err }, "Error while trying to get backup: ");
    res.status(500).send(err.message);
  }
});

app.listen(port, function () {
  log.info(`App listening on ${port}`);
});
