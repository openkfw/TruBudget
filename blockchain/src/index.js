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

const {
  startEmailNotificationWatcher,
} = require("./multichain-feed/email-notifications/notificationWatcher");
const { startSlave, registerNodeAtMaster } = require("./connectToChain");
const { startMultichainDaemon, configureChain } = require("./createChain");

const {
  moveBackup,
  verifyHash,
  verifyHashSha256,
  removeFile,
  createMetadataFileSha256,
} = require("./shell");

const app = express();
const port = process.env.PORT || 8085;

const ORGANIZATION = process.env.ORGANIZATION || "MyOrga";
const CHAINNAME = "TrubudgetChain";
const RPC_PORT = process.env.RPC_PORT || 8000;
const RPC_USER = process.env.RPC_USER || "multichainrpc";
const RPC_PASSWORD =
  process.env.RPC_PASSWORD || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j";
const RPC_ALLOW_IP = process.env.RPC_ALLOW_IP || "0.0.0.0/0";

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
  (process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_SERVICE === "ENABLED") ||
  false;

const connectArg = `${CHAINNAME}@${P2P_HOST}:${P2P_PORT}`;

const multichainDir = `${MULTICHAIN_DIR}/.multichain`;
const isMaster = P2P_HOST ? false : true;
const blockNotifyArg = process.env.BLOCKNOTIFY_SCRIPT
  ? `-blocknotify=${blockNotifyArg}`
  : "";

const SERVICE_NAME = process.env.KUBE_SERVICE_NAME || "";
const NAMESPACE = process.env.KUBE_NAMESPACE || "";
const EXPOSE_MC = process.env.EXPOSE_MC === "true" ? true : false;

if (EMAIL_SERVICE_ENABLED && !emailAuthSecret) {
  log.fatal(
    "Env variable 'JWT_SECRET' not set. Please set the same secret as in the trubudget email-service.",
  );
  os.exit(1);
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
        `Multichain stopped with exit code ${code} and signal ${signal}. Retry in ${retryIntervalMs /
          1000} Seconds...`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
      spawnProcess(startProcess);
    }
  });
};

const multichainFeedEnabled =
  process.env.MULTICHAIN_FEED === "ENABLED" || EMAIL_SERVICE_ENABLED;

configureChain(
  isMaster,
  CHAINNAME,
  multichainDir,
  RPC_PORT,
  RPC_USER,
  RPC_PASSWORD,
  RPC_ALLOW_IP,
  multichainFeedEnabled,
);

function initMultichain() {
  if (isMaster) {
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
      startSlave(
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
      () => registerNodeAtMaster(ORGANIZATION, API_PROTO, API_HOST, API_PORT),
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
    await new Promise((resolve) => setTimeout(resolve, retryInMs));
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

const loadConfig = (path) => {
  const config = yaml.safeLoad(fs.readFileSync(path, "utf8"));
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
        // TODO MD5 hashing is deprecated. Remove it in the future and keep only SHA256
        let validMD5 = false;
        if (!validSha256) {
          validMD5 = await verifyHash(config.DirectoryHash, extractPath);
        }
        const chainConfig = yaml.safeLoad(
          fs.readFileSync(chainConfigPath, "utf8"),
        );
        let correctConfig = chainConfig.includes(RPC_PASSWORD);

        if (config.hasOwnProperty("Organisation")) {
          const correctOrg = config.Organisation === ORGANIZATION;
          correctConfig = correctConfig && correctOrg;
        }
        if (correctConfig) {
          if (validSha256 || validMD5) {
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
            res.status(400).send("Not a valid TruBudget backup");
          }
        } else {
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

app.listen(port, function() {
  log.info(`App listening on ${port}`);
});
