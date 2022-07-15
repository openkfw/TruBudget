const spawn = require("child_process").spawn;
const shell = require("shelljs");
const log = require("./log/logger");
const mdLog = require("trubudget-logging-service").createPinoLogger(
  "Multichain-Deamon",
);
const os = require("os");
const includeLoggingParamsToArgs = require("./log/logArguments");

const configureChain = (
  isAlpha,
  chainName,
  multichainDir,
  MULTICHAIN_RPC_PORT,
  MULTICHAIN_RPC_USER,
  MULTICHAIN_RPC_PASSWORD,
  RPC_ALLOW_IP,
  isMultichainFeedEnabled,
) => {
  log.info(`Creating chain in directory ${multichainDir}`);
  shell.mkdir("-p", multichainDir);

  if (isAlpha) {
    log.info("Provisioning MultiChain");

    const {
      stdout,
      stderr,
    } = shell.exec(
      `multichain-util create ${chainName} -datadir=${multichainDir} -anyone-can-connect=false -anyone-can-send=false -anyone-can-receive=true -anyone-can-receive-empty=true -anyone-can-create=false -anyone-can-issue=false -anyone-can-admin=false -anyone-can-mine=false -anyone-can-activate=false-mining-diversity=0.3 -mine-empty-rounds=1 -protocol-version=20005 -admin-consensus-upgrade=.51 -admin-consensus-admin=.51 -admin-consensus-activate=.51 -admin-consensus-mine=.51 -admin-consensus-create=0 -admin-consensus-issue=0 -root-stream-open=false -maximum-block-size=83886080`,
      { silent: true },
    );

    stderr === ""
      ? log.info({ msg: stdout }, "Multichain Created: ")
      : log.error({ err: stderr }, "Error while creating Multichain");
  }

  if (isMultichainFeedEnabled) {
    log.info("Multichain feed is enabled");
    shell.exec(`cat <<EOF >"${multichainDir}/multichain.conf"
rpcport=${MULTICHAIN_RPC_PORT}
rpcuser=${MULTICHAIN_RPC_USER}
rpcpassword=${MULTICHAIN_RPC_PASSWORD}
rpcallowip=${RPC_ALLOW_IP}
walletnotifynew=${__dirname}/multichain-feed/multichain-feed %j
EOF
`);
  } else {
    shell.exec(`cat <<EOF >"${multichainDir}/multichain.conf"
rpcport=${MULTICHAIN_RPC_PORT}
rpcuser=${MULTICHAIN_RPC_USER}
rpcpassword=${MULTICHAIN_RPC_PASSWORD}
rpcallowip=${RPC_ALLOW_IP}
EOF
`);
  }

  shell.mkdir("-p", `${multichainDir}/${chainName}`);
  shell.cp(`${multichainDir}/multichain.conf`, `${multichainDir}/${chainName}`);
};

const startMultichainDaemon = (
  chainName,
  externalIpArg,
  blockNotifyArg,
  P2P_PORT,
  multichainDir,
  connectArg = "",
) => {
  const args = includeLoggingParamsToArgs([
    "-txindex",
    `${chainName}`,
    `${externalIpArg}`,
    `${blockNotifyArg}`,
    "-maxshowndata=100000",
    `-port=${P2P_PORT}`,
    "-autosubscribe=streams",
    `${connectArg}`,
    `-datadir=${multichainDir}`,
  ]);
  log.debug({ args }, "Starting multichain deamon with arguments");
  const mcproc = spawn("multichaind", args);

  mcproc.stdout.on("data", (data) => {
    data.msg ? mdLog.info(`${data.msg}`) : mdLog.info(`${data}`);
  });

  mcproc.stderr.on("data", (data) => {
    const error = Buffer.from(data).toString();
    if (error.includes("multichain-feed")) {
      mdLog.info({ feed: error }, "multichain-feed ");
    } else {
      mdLog.error({ err: error }, "Failed to start the alpha node: ");
    }
  });

  return mcproc;
};

module.exports = {
  startMultichainDaemon,
  configureChain,
};
