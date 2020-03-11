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

const {
  startEmailNotificationWatcher,
} = require("./multichain-feed/email-notifications/notificationWatcher");
const { startSlave, registerNodeAtMaster } = require("./connectToChain");
const { startMultichainDaemon, configureChain } = require("./createChain");

const {
  moveBackup,
  verifyHash,
  createMetadataFile,
  removeFile,
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
const isMaster = !P2P_HOST ? true : false;
const blockNotifyArg = process.env.BLOCKNOTIFY_SCRIPT
  ? `-blocknotify=${BLOCKNOTIFY_SCRIPT}`
  : "";

const SERVICE_NAME = process.env.KUBE_SERVICE_NAME || "";
const NAMESPACE = process.env.KUBE_NAMESPACE || "";
const EXPOSE_MC = process.env.EXPOSE_MC === "true" ? true : false;

if (EMAIL_SERVICE_ENABLED && !emailAuthSecret) {
  console.log(
    "Error: Env variable 'JWT_SECRET' not set. Please set the same secret as in the trubudget email-service.",
  );
  os.exit(1);
}

app.use(
  bodyParser.raw({
    type: "application/gzip",
    limit: "1024mb",
  }),
);

let mcproc;

const spawnProcess = startProcess => {
  mcproc = startProcess();
  isRunning = true;
  mcproc.on("close", async code => {
    isRunning = false;
    if (!autostart) {
      console.log(
        `>>> multichaind stopped with exit code ${code} and autorestart is disabled`,
      );
    } else {
      const retryIntervalMs = 10000;
      console.log(
        `>>> Multichain stopped. Retry in ${retryIntervalMs / 1000} Seconds...`,
      );
      await new Promise(resolve => setTimeout(resolve, retryIntervalMs));
      spawnProcess(startProcess);
    }
  });
};

configureChain(
  isMaster,
  CHAINNAME,
  multichainDir,
  RPC_PORT,
  RPC_USER,
  RPC_PASSWORD,
  RPC_ALLOW_IP,
  EMAIL_SERVICE_ENABLED,
  NOTIFICATION_PATH,
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

  const k8sApi = kc.makeApiClient(k8s.Core_v1Api);
  const kubernetesClient = new KubernetesClient(k8sApi);

  kubernetesClient.getServiceIp(SERVICE_NAME, NAMESPACE).then(response => {
    console.log(`externalIp: ${response}`);
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

const stopMultichain = async mcproc => {
  while (isRunning) {
    mcproc.kill();
    const retryInMs = 3000;
    await new Promise(resolve => setTimeout(resolve, retryInMs));
  }
  console.log("Multichain process killed...");
};

app.get("/chain", async (req, res) => {
  try {
    console.log("Start packaging");
    autostart = false;
    await stopMultichain(mcproc);
    await createMetadataFile(CHAINNAME, multichainDir);
    res.setHeader("Content-Type", "application/gzip");
    res.setHeader(
      "Content-Disposition",
      ` attachment; filename="${CHAINNAME}.gz"`,
    );
    tar
      .pack(`${multichainDir}/${CHAINNAME}`, {
        finish: () => {
          console.log("Restarting multichain...");
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
    console.log(err);
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

const loadConfig = path => {
  const config = yaml.safeLoad(fs.readFileSync(path, "utf8"));
  removeFile(path);
  return config;
};

app.post("/chain", async (req, res) => {
  const extractPath = `/tmp/backup${Date.now()}`;
  const metadataPath = `${extractPath}/metadata.yml`;
  try {
    const unTARer = rawTar.extract();
    unTARer.on("error", err => {
      console.log(err.message);
      unTARer.destroy();
      res.status(400).send(err.message);
    });
    const extract = tar.extract(extractPath, { extract: unTARer });
    const file = streamifier.createReadStream(req.body);
    const stream = file.pipe(extract);
    stream.on("finish", async () => {
      if (fs.existsSync(metadataPath)) {
        const config = loadConfig(metadataPath);
        const valid = await verifyHash(config.DirectoryHash, extractPath);
        if (valid) {
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
          console.log("Not a valid trubudget backup....");
          res.status(400).send("Not a valid TruBudget backup");
        }
      } else {
        res.status(400).send("Metadata not available");
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.listen(port, function() {
  console.log(`App listening on ${port}`);
});
