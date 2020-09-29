const shell = require("shelljs");
const fs = require("fs");

const { md5Dir } = require("./md5");

const createMetadataFile = async (chainName, multichainDir, organisation) => {
  const dirHash = await md5Dir(`${multichainDir}/${chainName}`);
  const filePath = `${multichainDir}/${chainName}/metadata.yml`;
  shell.touch(filePath);
  console.log("----- Backup Metadata -----");
  const ts = Date.now();
  shell
    .echo(
      `ChainName: ${chainName}\nOrganisation: ${organisation}\nTimestamp: ${ts}\nDirectoryHash: ${dirHash}`,
    )
    .to(filePath);
};

const verifyHash = async (backupDirectoryHash, extractPath) => {
  return (await md5Dir(extractPath)) === backupDirectoryHash;
};

const createCurrentChainBackupDir = currentChainBackupDir => {
  if (fs.existsSync(currentChainBackupDir)) {
    shell.rm("-rf", currentChainBackupDir);
  }
  shell.mkdir(currentChainBackupDir);
};

const removeFile = path => {
  shell.rm(path);
};

const moveBackup = async (multichainDir, extractPath, chainName) => {
  const targetDir = `${multichainDir}/${chainName}`;
  const currentChainBackupDir = "/root/bcBackup";
  createCurrentChainBackupDir(currentChainBackupDir);
  if (fs.existsSync(targetDir)) {
    // just mv is not workin on kube
    shell.cp("-R", `${targetDir}/*`, currentChainBackupDir);
    shell.rm('-rf', `${targetDir}`);
    shell.mkdir(targetDir)
    shell.cp("-R", `${extractPath}/*`, `${targetDir}/`);
  }
  shell.rm("-rf", `${extractPath}`);
};

module.exports = {
  createMetadataFile,
  verifyHash,
  moveBackup,
  removeFile,
};
