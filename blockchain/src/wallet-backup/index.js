const fs = require("fs");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const log = require("./../log/logger");
const shell = require("shelljs");


const adaptMultichianParams = async (paramsFile, newParamsFile) => {
  log.info("Adapting multichain params...");
  let newParams = [];
  fs.readFileSync(newParamsFile)
    .toString()
    .split(/\r?\n/)
    .forEach((line) => {
      if (
        line.includes("address-pubkeyhash-version") ||
        line.includes("address-scripthash-version") ||
        line.includes("private-key-version") ||
        line.includes("address-checksum-value")
      ) {
        newParams.push(line);
      }
    });

  let paramsFileContent = fs.readFileSync(paramsFile).toString();

  paramsFileContent = paramsFileContent
    .replace(/address-pubkeyhash-version/g, "# address-pubkeyhash-version")
    .replace(/address-scripthash-version/g, "# address-scripthash-version")
    .replace(/private-key-version/g, "# private-key-version")
    .replace(/address-checksum-value/g, "# address-checksum-value")
    .concat(
      "# THIS DATA HAS BEEN INSERTED DURING THE MIGRATION STEP! \n" +
      "# THE ORGINAL VALUES CAN BE FOUND ABOVE.\n",
    )
    .concat(newParams.join(" \n"));

  fs.writeFileSync(paramsFile, paramsFileContent);
};

const importWallet = async (walletPath, chainName) => {
  //TODO import wallet by copying the wallet folder and the wallet.dat file from backup to destination (TrubudgetChain folder)
  // const { stdout } = await exec(
  //   `multichain-cli ${chainName} importwallet ${walletPath}`,
  // );

  console.log("importing wallet..");
  shell.mv(`${walletPath}/wallet`, `/root/.multichain/${chainName}/wallet`);
  shell.mv(`${walletPath}/wallet.dat`, `/root/.multichain/${chainName}/wallet.dat`);

};

const backupWallet = async (chainName, destinationPath) => {
  const { stdout } = await exec(
    `multichain-cli ${chainName} dumpwallet ${chainName}-wallet.txt`,
  );
  shell.mv(`/home/node/${chainName}-wallet.txt`, destinationPath);
  log.debug(stdout);
  //TODO this is not needed anymore, since we don't use the importwallet rpc command anymore on the destination chain
};

const listAvailableWallets = async (chainName) => {
  const { stdout } = await exec(`multichain-cli ${chainName} getaddresses`);
  log.debug({ message: "Available wallets:", stdout });

  return stdout;
};

module.exports = {
  adaptMultichianParams,
  importWallet,
  listAvailableWallets,
  backupWallet,
};
