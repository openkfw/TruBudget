const axios = require("axios");
const spawn = require("child_process").spawn;
const fs = require("fs");

// global:
let address;

async function relax(ms) {
  return new Promise(res => setInterval(res, ms));
}

function logFileContent(path) {
  const content = fs.readFileSync(path, {
    encoding: "utf8",
  });
  console.log(">>", path, content);
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
  multichainDir
) {
  const prog = "multichaind";

  const serverConfigPath = multichainDir + "/multichain.conf";
  logFileContent(serverConfigPath);

  const chainPath = multichainDir + `/${chainName}`;
  const chainConfigPath = `${chainPath}/multichain.conf`;
  console.log(
    chainName,
    apiProto,
    apiHost,
    apiPort,
    p2pPort,
    connectArgs,
    blockNotifyArg,
    externalIpArg,
  );
  const args = [
    "-txindex",
    `-port=${p2pPort}`,
    `-autosubscribe=streams`,
    connectArgs,
    blockNotifyArg,
    externalIpArg,
  ];
  console.log(`>>> Args: ${args}`);

  if (fs.existsSync(chainConfigPath)) {
    logFileContent(chainConfigPath);
  } else {
    console.log(
      `Warning: chain config not found at ${chainConfigPath}, restoring from ${serverConfigPath}. Is the master node reachable from this node?`,
    );
    if (!fs.existsSync(chainPath)) {
      fs.mkdirSync(chainPath);
    }
    fs.copyFileSync(serverConfigPath, chainConfigPath);
  }

  const mc = spawn(prog, args);

  mc.stdout.on("data", data => {
    console.log(`${prog}  | ${data.toString()}`);
    const regex = new RegExp("[0-9a-zA-Z]{30,40}");
    const match = regex.exec(data);
    if (match) address = match[0];
  });

  return mc;
}

function askMasterForPermissions(address, organization, proto, host, port) {
  const url = `${proto}://${host}:${port}/api/network.registerNode`;
  console.log(`>>> Registration URL: ${url}`);
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
    while (!address){
     await relax(5000);
    }
    console.log(`>>> Registering ${organization} node address ${address}`);
    await askMasterForPermissions(address, organization, proto, host, port);
    console.log(">>> Node address registered successfully (approval pending).");
  } catch (error) {
    console.log(
      `>>> Could not register (${error}). Retry in ${retryIntervalMs /
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
