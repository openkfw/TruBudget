const axios = require("axios");
const spawn = require("child_process").spawn;
const fs = require("fs");
const log = require("./log/logger");
const mdLog = require("trubudget-logging-service").createPinoLogger(
  "Multichain-Slave",
);
const getDeamonArguments = require("./log/logArguments");
// global:
let address;

async function relax(ms) {
  return new Promise((res) => setInterval(res, ms));
}

function logFileContent(path) {
  const content = fs.readFileSync(path, {
    encoding: "utf8",
  });
  log.info(`File Path: ${path}`);
  log.info(`File Content: ${content}`);
}

function startSlave(
  chainName,
  apiProto,
  apiHost,
  apiPort,
  p2pPort,
  connectArgs,
  blockNotifyArg,
  externalIpArg,
  multichainDir,
) {
  const prog = "multichaind";

  const serverConfigPath = multichainDir + "/multichain.conf";
  logFileContent(serverConfigPath);

  const chainPath = multichainDir + `/${chainName}`;
  const chainConfigPath = `${chainPath}/multichain.conf`;
  log.info(
    {
      chainName,
      apiProto,
      apiHost,
      apiPort,
      p2pPort,
      connectArgs,
      blockNotifyArg,
      externalIpArg,
    },
    "Start slave nodes with params",
  );
  const args = getDeamonArguments([
    "-txindex",
    `-port=${p2pPort}`,
    "-autosubscribe=streams",
    "-printtoconsole",
    connectArgs,
    blockNotifyArg,
    externalIpArg,
  ]);
  log.info(args, "Chain Arguments: ");

  if (fs.existsSync(chainConfigPath)) {
    logFileContent(chainConfigPath);
  } else {
    log.warn(
      `Chain config not found at ${chainConfigPath}, restoring from ${serverConfigPath}. Is the master node reachable from this node?`,
    );
    if (!fs.existsSync(chainPath)) {
      try {
        fs.mkdirSync(chainPath);
      } catch (err) {
        log.error({ err }, "Error while creating directory");
      }
    }

    try {
      fs.copyFileSync(serverConfigPath, chainConfigPath);
      logFileContent(chainConfigPath);
    } catch (err) {
      log.error({ err }, "Error while copying chain config file");
    }
  }

  log.debug({ args }, "Starting multichain deamon with arguments");

  const mc = spawn(prog, args);

  mc.stdout.on("data", (data) => {
    mdLog.info(`${data}`);
    const regex = new RegExp("[0-9a-zA-Z]{30,40}");
    const match = regex.exec(data);
    if (match) address = match[0];
  });

  mc.stderr.on("data", (err) => log.error({ err }, "Error in Slave"));

  mc.on("close", (code, signal) =>
    mdLog.warn(
      `Multichaind (slave node) closed with exit code ${code} and signal ${signal}.`,
    ),
  );

  return mc;
}

function askMasterForPermissions(address, organization, proto, host, port) {
  const url = `${proto}://${host}:${port}/api/network.registerNode`;
  log.info("Registration URL: " + url);
  return axios.post(url, {
    apiVersion: "1.0",
    data: {
      address,
      organization,
    },
  });
}

async function registerNodeAtMaster(organization, proto, host, port) {
  const retryIntervalMs = 10000;
  try {
    while (!address) {
      await relax(5000);
    }

    log.info(`Registering ${organization} node address ${address}`);
    await askMasterForPermissions(address, organization, proto, host, port);
    log.info("Node address registered successfully (approval pending).");
  } catch (error) {
    log.error(
      `Could not register (${error}). Retry in ${retryIntervalMs /
        1000} seconds ...`,
    );
    await relax(retryIntervalMs);
    await registerNodeAtMaster(organization, proto, host, port);
  }
}

module.exports = {
  startSlave,
  registerNodeAtMaster,
};
