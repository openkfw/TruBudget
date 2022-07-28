const https = require("https");
const axios = require("axios");
const spawn = require("child_process").spawn;
const fs = require("fs");
const log = require("./log/logger");
const mdLog = require("trubudget-logging-service").createPinoLogger(
  "Multichain-Beta",
);
const includeLoggingParamsToArgs = require("./log/logArguments");
// global:
let address;

async function relax(ms) {
  return new Promise((res) => {
    setInterval(res, ms);
  });
}

function logFileContent(path) {
  const content = fs.readFileSync(path, {
    encoding: "utf8",
  });
  log.info(`File Path: ${path}`);
  log.info(`File Content: ${content}`);
}

function startBeta(
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
    "Start beta nodes with params",
  );

  const args = includeLoggingParamsToArgs([
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
      `Chain config not found at ${chainConfigPath}, restoring from ${serverConfigPath}. Is the alpha node reachable from this node?`,
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
    mdLog.debug(`${data}`);
    const regex = /[0-9a-zA-Z]{30,40}/;
    const match = regex.exec(data);
    // Store own wallet address into global "address"
    if (match) {
      address = match[0];
      log.info(
        "Wallet address registered. Entry added in nodes stream of network of alpha node, approval needed.",
      );
    }
  });

  mc.stderr.on("data", (err) =>
    log.error(Buffer.from(err).toString(), "Error in beta"),
  );

  mc.on("close", (code, signal) =>
    mdLog.warn(
      `Multichaind (beta node) closed with exit code ${code} and signal ${signal}.`,
    ),
  );

  return mc;
}

function askAlphaForPermissions(
  address,
  organization,
  proto,
  host,
  port,
  certPath,
  certCaPath,
  certKeyPath,
) {
  const url = `${proto}://${host}:${port}/api/network.registerNode`;
  log.info(`Trying to register at ${url}`);
  if (certPath) {
    log.debug(
      `Connecting with alpha node using certificate ${certPath}, ca ${certCaPath},key ${certKeyPath} ...`,
    );

    const httpsAgent = new https.Agent(
      certCaPath && certKeyPath
        ? {
            cert: fs.readFileSync(certPath),
            ca: fs.readFileSync(certCaPath),
            key: fs.readFileSync(certKeyPath),
            rejectUnauthorized: process.env.NODE_ENV !== "production",
          }
        : {
            cert: fs.readFileSync(certPath),
            rejectUnauthorized: process.env.NODE_ENV !== "production",
          },
    );
    return axios.post(
      url,
      {
        apiVersion: "1.0",
        data: {
          address,
          organization,
        },
      },
      { httpsAgent },
    );
  }
  log.debug("Connecting with alpha node without certificate ...");
  return axios.post(url, {
    apiVersion: "1.0",
    data: {
      address,
      organization,
    },
  });
}

async function registerNodeAtAlpha(
  organization,
  proto,
  host,
  port,
  certPath,
  certCaPath,
  certKeyPath,
) {
  const retryIntervalMs = 10000;
  try {
    log.info(`Waiting for registration at alpha node (${host}:${port})`);
    while (!address) {
      log.debug(
        "Wallet address not yet registered at alpha node waiting for 5 seconds ...",
      );
      await relax(5000);
    }

    log.info(
      `Registering ${organization} node address ${address} via alpha API`,
    );
    await askAlphaForPermissions(
      address,
      organization,
      proto,
      host,
      port,
      certPath,
      certCaPath,
      certKeyPath,
    );
    log.info("Node address registered successfully (approval pending).");
  } catch (error) {
    log.error(
      `Could not register (${error}). Retry in ${
        retryIntervalMs / 1000
      } seconds ...`,
    );
    await relax(retryIntervalMs);
    await registerNodeAtAlpha(organization, proto, host, port, certPath);
  }
}

module.exports = {
  startBeta,
  registerNodeAtAlpha,
};
