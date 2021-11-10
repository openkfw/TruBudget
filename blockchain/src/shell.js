const shell = require("shelljs");
const fs = require("fs");

const { md5Dir } = require("./md5");
const { sha256Dir } = require("./sha256");

const logger = require("./log/logger");

const verifyHash = async (backupDirectoryHash, extractPath) =>
  (await md5Dir(extractPath)) === backupDirectoryHash;

const createMetadataFileSha256 = async (
  chainName,
  multichainDir,
  organisation,
) => {
  let dirHash;
  try {
    dirHash = await sha256Dir(`${multichainDir}/${chainName}`);
  } catch (err) {
    logger.error({ err }, "sha256 error");
  }

  const filePath = `${multichainDir}/${chainName}/metadata.yml`;
  shell.touch(filePath);
  logger.info("Backup Metadata SHA256");
  const ts = Date.now();
  shell
    .echo(
      `ChainName: ${chainName}\nOrganisation: ${organisation}\nTimestamp: ${ts}\nDirectoryHash: ${dirHash}`,
    )
    .to(filePath);
};

const verifyHashSha256 = async (backupDirectoryHash, extractPath) => {
  const dirHash = await sha256Dir(extractPath);

  return dirHash === backupDirectoryHash;
};

const createCurrentChainBackupDir = (currentChainBackupDir) => {
  logger.trace({ dir: currentChainBackupDir }, "Creating backup directory");
  if (fs.existsSync(currentChainBackupDir)) {
    shell.rm("-rf", currentChainBackupDir);
  }
  shell.mkdir(currentChainBackupDir);
};

const removeFile = (path) => {
  shell.rm(path);
};

const moveBackup = async (multichainDir, extractPath, chainName) => {
  logger.debug("Moving backup");
  const targetDir = `${multichainDir}/${chainName}`;
  const currentChainBackupDir = "/root/bcBackup";
  createCurrentChainBackupDir(currentChainBackupDir);
  if (fs.existsSync(targetDir)) {
    // just mv is not workin on kube
    shell.cp("-R", `${targetDir}/*`, currentChainBackupDir);
    shell.rm("-rf", `${targetDir}`);
    shell.mkdir(targetDir);
    shell.cp("-R", `${extractPath}/*`, `${targetDir}/`);
  }
  shell.rm("-rf", `${extractPath}`);
};

module.exports = {
  verifyHash,
  createMetadataFileSha256,
  verifyHashSha256,
  moveBackup,
  removeFile,
};
