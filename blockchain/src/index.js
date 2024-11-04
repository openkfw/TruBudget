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
const shell = require("shelljs");

const { startEmailNotificationWatcher } = require("./multichain-feed/email-notifications/notificationWatcher");
const { startBeta, registerNodeAtAlpha } = require("./connectToChain");
const { startMultichainDaemon, configureChain } = require("./createChain");
const { isMultichainReady } = require("./readiness");

const { importWallet, listAvailableWallets } = require("./wallet-backup");

const { moveBackup, verifyHashSha256, removeFile, createMetadataFileSha256 } = require("./shell");

const config = require("./config");

const app = express();

const CHAINNAME = "TrubudgetChain";
let AUTOSTART = config.autostart;
let isRunning = AUTOSTART ? true : false;
const connectArg = `${CHAINNAME}@${config.p2p.host}:${config.p2p.port}`;
const multichainDir = `${config.multichain.dir}/.multichain`;
const isAlpha = config.p2p.host ? false : true;
const blockNotifyArg = config.blocknotifyScript ? `-blocknotify=${config.blocknotifyScript}` : "";

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
    if (!AUTOSTART) {
      log.info(`multichaind stopped with exit code ${code} and signal ${signal}. Autorestart is disabled`);
    } else {
      const retryIntervalMs = 10000;
      log.info(
        `Multichain stopped with exit code ${code} and signal ${signal}. Retry in ${retryIntervalMs / 1000} Seconds...`,
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
  config.multichain.rpcPort,
  config.multichain.rpcUser,
  config.multichain.rpcPassword,
  config.multichain.rpcAllowIp,
  config.multichainFeedEnabled,
);

function initMultichain() {
  if (!AUTOSTART) {
    isRunning = false;
    log.info(
      "Multichain not started since autostart is disabled. Make sure to set the env variable AUTOSTART to true.",
    );
    return;
  }
  if (isAlpha) {
    spawnProcess(() => startMultichainDaemon(CHAINNAME, externalIpArg, blockNotifyArg, config.p2p.port, multichainDir));
  } else {
    spawnProcess(() =>
      startBeta(
        CHAINNAME,
        config.api.protocol,
        config.api.host,
        config.api.port,
        config.p2p.port,
        connectArg,
        blockNotifyArg,
        externalIpArg,
        multichainDir,
        config.orgazation,
      ),
    );
    setTimeout(
      () =>
        registerNodeAtAlpha(
          config.orgazation,
          config.api.protocol,
          config.api.host,
          config.api.port,
          config.cert.path,
          config.cert.caPath,
          config.cert.keyPath,
        ),
      5000,
    );
  }
}

let externalIpArg = process.env.EXTERNAL_IP && process.env.EXTERNAL_IP !== "" ? `-externalip=${config.externalIp}` : "";

if (config.exposeMc) {
  const kc = new k8s.KubeConfig();

  if (fs.existsSync(os.homedir() + "/.kube/config") /* ? */) {
    kc.loadFromDefault();
  } else {
    kc.loadFromCluster();
  }

  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  const kubernetesClient = new KubernetesClient(k8sApi);

  kubernetesClient.getServiceIp(config.kubeServiceName, config.kubeNamespace).then((response) => {
    log.info(`externalIp: ${response}`);
    if (response) {
      externalIpArg = `-externalip=${response}`;
    }

    initMultichain();
    if (config.emailServiceEnabled) {
      startEmailNotificationWatcher(
        config.notification.path,
        `${config.email.host}:${config.email.port}`,
        config.email.jwtSecret,
        config.notification.maxLifetime,
        config.notification.sendInterval,
        config.email.ssl,
        config.email.jwtAlgorithm,
      );
    }
  });
} else {
  initMultichain();
  if (config.emailServiceEnabled) {
    startEmailNotificationWatcher(
      config.notification.path,
      `${config.email.host}:${config.email.port}`,
      config.email.jwtSecret,
      config.notification.maxLifetime,
      config.notification.sendInterval,
      config.email.ssl,
      config.email.jwtAlgorithm,
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
    AUTOSTART = false;
    await stopMultichain(mcproc);
    await createMetadataFileSha256(CHAINNAME, multichainDir, config.orgazation);
    res.setHeader("Content-Type", "application/gzip");
    res.setHeader("Content-Disposition", ` attachment; filename="${CHAINNAME}.gz"`);
    tar
      .pack(`${multichainDir}/${CHAINNAME}`, {
        finish: () => {
          log.info("Restarting multichain");
          spawnProcess(() =>
            startMultichainDaemon(CHAINNAME, externalIpArg, blockNotifyArg, config.p2p.port, multichainDir),
          );
          AUTOSTART = true;
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
    res.status(200).header({ "Content-Type": "application/json" }).send("Ready");
  } else if (!isReady && isRunning) {
    res.status(504).header({ "Content-Type": "application/json" }).send("Not ready. Multichain is starting ...");
  } else {
    res.status(504).header({ "Content-Type": "application/json" }).send("Not ready. Multichain process stopped");
  }
});

const loadConfig = (path) => {
  const config = yaml.load(fs.readFileSync(path, "utf8"));
  removeFile(path);
  return config;
};

app.post("/restoreWallet", async (req, res) => {
  if (!config.nodeEnv === "development") {
    return res.status(401).send();
  }

  const extractPath = `/tmp/backup${Date.now()}`;
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
      try {
        AUTOSTART = false;
        if (isRunning) await stopMultichain(mcproc);
        await importWallet(`${extractPath}`, CHAINNAME);
        if (config.multichainFeedEnabled) {
          log.info("Multichain feed is enabled");
          shell.exec(`cat <<EOF >"${multichainDir}/multichain.conf"
rpcport=${config.multichain.rpcPort}
rpcuser=${config.multichain.rpcUser}
rpcpassword=${config.multichain.rpcPassword}
rpcallowip=${config.multichain.rpcAllowIp}
walletnotifynew=${__dirname}/multichain-feed/multichain-feed %j`);
        } else {
          shell.exec(`cat <<EOF >"${multichainDir}/multichain.conf"
rpcport=${config.multichain.rpcPort}
rpcuser=${config.multichain.rpcUser}
rpcpassword=${config.multichain.rpcPassword}
rpcallowip=${config.multichain.rpcAllowIp}`);
        }
        await spawnProcess(() =>
          startMultichainDaemon(CHAINNAME, externalIpArg, blockNotifyArg, config.p2p.port, multichainDir),
        );
        AUTOSTART = true;
        /*eslint no-promise-executor-return: "off"*/
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const availableWallets = await listAvailableWallets(CHAINNAME);
        return res.json(`Ok. Available wallets are: ${JSON.stringify(availableWallets)}`);
      } catch (err) {
        log.error({ err }, "Error while trying to restore wallet: ");
        return res.status(500).send(err.message);
      }
    });
  } catch (err) {
    log.error({ err }, "Error while trying to restore wallet: ");
    return res.status(500).send(err.message);
  }
});

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
        const metadataConfig = loadConfig(metadataPath);
        const validSha256 = await verifyHashSha256(metadataConfig.DirectoryHash, extractPath);
        const chainConfig = yaml.load(fs.readFileSync(chainConfigPath, "utf8"));
        let correctConfig = chainConfig.includes(config.multichain.rpcPassword);

        if (metadataConfig.hasOwnProperty("Organisation")) {
          const correctOrg = metadataConfig.Organisation === config.orgazation;
          correctConfig = correctConfig && correctOrg;
        }
        //Check for major version compatibility
        const compatibleVersions =
          metadataConfig.hasOwnProperty("Version") && metadataConfig.Version.split(".")[0] === version.split(".")[0];

        if (correctConfig && compatibleVersions) {
          if (validSha256) {
            AUTOSTART = false;
            await stopMultichain(mcproc);
            await moveBackup(multichainDir, extractPath, CHAINNAME);
            spawnProcess(() =>
              startMultichainDaemon(CHAINNAME, externalIpArg, blockNotifyArg, config.p2p.port, multichainDir),
            );
            AUTOSTART = true;
            res.send("OK");
          } else {
            log.warn("Request did not contain a valid trubudget backup");
            if (!compatibleVersions) {
              log.warn("The uploaded backup is not compatible with this version of TruBudget");
            }
            res.status(400).send("Not a valid TruBudget backup");
          }
        } else {
          if (!compatibleVersions) {
            log.warn("The uploaded backup is not compatible with this version of TruBudget");
          }
          log.warn("Tried to Backup with invalid configuration");
          res.status(400).send("Backup with these configurations is not permitted");
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

app.listen(config.port, function () {
  log.info(`App listening on ${config.port}`);
});
