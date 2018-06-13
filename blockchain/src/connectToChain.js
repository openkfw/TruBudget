const axios = require("axios");
const spawn = require("child_process").spawn;
const fs = require("fs");

// global:
let address;

async function relax(ms) {
  return new Promise(res => setInterval(res, ms));
}

function startMultichainDaemon() {
  const prog = "multichaind";
  const args = process.argv.slice(2);
  console.log(`>>> Connecting to ${args[args.length - 1]}`);
  console.log(`>>> args=${args.map(x => x.startsWith("-rpcpassword=") ? "-rpcpassword=..." : x)}`);
  const mc = spawn(prog, args);

  mc.stdout.on('data', (data) => {
    console.log(`${prog}  | ${data.toString()}`);
    const regex = new RegExp('[0-9a-zA-Z]{30,40}');
    const match = regex.exec(data);
    if (match) address = match[0];
  })

  mc.on('close', async (code) => {
    if (code === 1) {
      const retryIntervalMs = 10000;
      console.log(`>>> Connect: Failed to connect to Master. Retry in ${retryIntervalMs / 1000} Seconds...`);
      await relax(retryIntervalMs);
      startMultichainDaemon();
    } else {
      console.log('>>> Connect: Success!');
    }
  });
}

function askMasterForPermissions(address, organization) {
  const protocol = process.env.API_PROTO;
  const host = process.env.API_HOST;
  const port = process.env.API_PORT;
  const url = `${protocol}://${host}:${port}/api/nodes`;
  console.log(`>>> Registration URL: ${url}`)
  return axios.post(url, {
    address,
    organization,
  });
}

async function registerNodeAtMaster() {
  const retryIntervalMs = 10000;
  try {
    while (!address) await relax(5000);
    const organization = process.env.ORGANIZATION;
    console.log(`>>> Registering ${organization} node address ${address}`);
    await askMasterForPermissions(address, organization)
    console.log('>>> Node address registered successfully (approval pending).');
  } catch (error) {
    console.log(`>>> Could not register (${error}). Retry in ${retryIntervalMs / 1000} seconds ...`);
    await relax(retryIntervalMs);
    await registerNodeAtMaster();
  }
}

startMultichainDaemon();
setTimeout(registerNodeAtMaster, 5000);
