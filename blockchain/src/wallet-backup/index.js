const util = require("util");
const exec = util.promisify(require("child_process").exec);
const log = require("./../log/logger");
const shell = require("shelljs");

const importWallet = async (walletPath, chainName) => {
  console.log("importing params ...");
  shell.mv(`${walletPath}/params.dat`, `/root/.multichain/${chainName}/params.dat`);
  shell.mv(`${walletPath}/params.dat.bak`, `/root/.multichain/${chainName}/params.dat.bak`);

  console.log("importing wallet...");
  shell.mv(`${walletPath}/wallet`, `/root/.multichain/${chainName}/wallet`);
  shell.mv(`${walletPath}/wallet.dat`, `/root/.multichain/${chainName}/wallet.dat`);

};

const listAvailableWallets = async (chainName) => {
  const {stdout} = await exec(`multichain-cli ${chainName} getaddresses`);
  log.debug({message: "Available wallets:", stdout});

  return stdout;
};

module.exports = {
  importWallet,
  listAvailableWallets,
};
