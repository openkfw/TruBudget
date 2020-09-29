const fs = require("fs");
const tar = require("tar-fs");
const rawTar = require("tar-stream");
const yaml = require("js-yaml");
const shell = require("shelljs");
const { md5Dir } = require("./src/md5");

const path = process.argv[2];
if (!path) {
  console.error(
    "Use this script to fix an invalid hash in a TruBudget backup.\n" +
      "type \"npm run backup_fix -- -h\" for more details ",
  );
  process.exit(0);
} else if (!path || path === "-h" || path === "--help") {
  console.log(
    "Use this script to fix an invalid hash in a TruBudget backup.\n" +
      "Use the second argument to specify the path to the backup you want to fix.\n" +
      "Please use quotation marks for the path\n" +
      "e.g. npm run backup_fix -- \"/Users/username/Desktop/backup.gz\""
  );
  process.exit(0);
}
fs.access(path, fs.R_OK, (err) => {
  if (err) {
    console.err("Error: This is not valid path");
    process.exit(1);
  }
});
if (process.argv.length > 3) {
  console.log("All arguments after the path will be ignored")
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

    await updateMetadataFile(config, extractPath, metadataPath);
    tar.pack(extractPath).pipe(fs.createWriteStream(`${filePath} updated.gz`));
  }
});

const loadConfig = (path) => {
  const config = yaml.safeLoad(fs.readFileSync(path, "utf8"));
  shell.rm(path);
  return config;
};

const createHash = async (extractPath) => {
  return md5Dir(extractPath);
};

const updateMetadataFile = async (config, extractPath, metadataPath) => {
  const hash = await createHash(extractPath);
  shell.touch(metadataPath);
  console.log("----- Backup Metadata -----");
  const ts = Date.now();
  const organisation = config.hasOwnProperty("Organisation")
    ? `\nOrganisation: ${config.Organisation}`
    : "";
  shell
    .echo(
      `ChainName: ${config.ChainName}${organisation}\nTimestamp: ${ts}\nDirectoryHash: ${hash}`,
    )
    .to(metadataPath);
  return config;
};
