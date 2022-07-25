const fs = require("fs");
const tar = require("tar-fs");
const rawTar = require("tar-stream");
const yaml = require("js-yaml");
const shell = require("shelljs");
const { version } = require("./package.json");
const { sha256Dir } = require("./src/sha256.js");

const printHelp = () => {
  console.log(`
    Usage:           node check_backup [BACKUP] [OPTION]

    Options:
      -h/--help      prints help
      -f/--fix       creates a new fixed backup file in the same directory

    Arguments:
      BACKUP         A Trubudget backup.gz file`);
};

const isValidPath = (path) => {
  if (!path || path === "-h" || path === "--help") {
    return false;
  }
  fs.access(path, fs.R_OK, (err) => {
    if (err) {
      console.err("Error: This is not valid path");
      return false;
    }
  });
  return true;
};

const path = process.argv[2];
const option = process.argv[3];
let fixOption = false;

// Check arguments
if (!isValidPath(path)) {
  printHelp();
  process.exit(1);
}
if (process.argv.length > 4) {
  console.log("All arguments after the path will be ignored");
}
if (option === "-f" || option === "--fix") {
  fixOption = true;
}

const filePath = path.substring(0, path.lastIndexOf("."));
const extractPath = `/tmp/backup${Date.now()}`;
const metadataPath = `${extractPath}/metadata.yml`;

const unTARer = rawTar.extract();
unTARer.on("error", (err) => {
  console.log(err.message);
  unTARer.destroy();
});
const extract = tar.extract(extractPath, { extract: unTARer });
const file = fs.createReadStream(path);
const stream = file.pipe(extract);

stream.on("finish", async () => {
  if (fs.existsSync(metadataPath)) {
    const config = loadConfig(metadataPath);

    const hash = await createHash(extractPath);
    const isValidMetadataFile = config.DirectoryHash === hash;

    //Check for major version compatibility
    const incompatibleVersions =
      config.hasOwnProperty("Version") &&
      config.Version.split(".")[0] === version.split(".")[0];

    if (isValidMetadataFile) {
      console.log("The provided backup file is valid\n");
      console.log("No updated backup is created");
      process.exit(1);
    } else if (incompatibleVersions) {
      console.log("The provided backup is from a prior major version.\n");
      console.log(
        "Use the migration guide to restore the backup. More information can be found on GitHub.\n",
      );
      console.log("No updated backup is created");
      process.exit(1);
    } else {
      console.log("The provided backup file is invalid\n");
    }
    if (fixOption) {
      console.log("Create updated backup...\n");
      await updateMetadataFile(config, hash, metadataPath);
      tar
        .pack(extractPath)
        .pipe(fs.createWriteStream(`${filePath}_updated.gz`));
      console.log(`Saved the fixed backup file in ${filePath}_updated.gz`);
    } else {
      console.log(
        "No updated backup is created since the --fix option was not provided",
      );
    }
  }
});

const loadConfig = (path) => {
  const config = yaml.load(fs.readFileSync(path, "utf8"));
  shell.rm(path);
  return config;
};

const createHash = async (extractPath) => {
  return sha256Dir(extractPath);
};

const updateMetadataFile = async (config, hash, metadataPath) => {
  shell.touch(metadataPath);
  console.log("----- Backup Metadata -----");
  const ts = Date.now();
  const organisation = config.hasOwnProperty("Organisation")
    ? `\nOrganisation: ${config.Organisation}`
    : "";
  shell
    .echo(
      `ChainName: ${config.ChainName}${organisation}\nTimestamp: ${ts}\nDirectoryHash: ${hash}\n Version: ${version}\n`,
    )
    .to(metadataPath);
  return config;
};
