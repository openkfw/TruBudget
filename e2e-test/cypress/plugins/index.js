// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const axios = require("axios");
const path = require("path");
const Excel = require("exceljs");
const fs = require("fs");
const tar = require("tar-fs");
const rawTar = require("tar-stream");
const yaml = require("js-yaml");
const shell = require("shelljs");
const dotenvPlugin = require("cypress-dotenv");

function reportsReadiness(baseUrl) {
  return axios
    .get(`${baseUrl}/api/readiness`)
    .then(() => {
      console.log("API reports readiness!");
      return true;
    })
    .catch(err => {
      console.log(`API is not ready yet: ${err}`);
      return false;
    });
}

function hasLoginReady(baseUrl) {
  return axios
    .post(`${baseUrl}/api/user.authenticate`, {
      apiVersion: "1.0",
      data: {
        user: {
          id: "mstein",
          password: "test"
        }
      }
    })
    .then(() => {
      console.log("Login successful!");
      return true;
    })
    .catch(err => {
      console.log(`Authentication failed - likely provisioning is still ongoing; err: ${err}`);
      return false;
    });
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

async function awaitApiReady(baseUrl) {
  let nRetries = 10;
  while (nRetries > 0 && !(await reportsReadiness(baseUrl))) {
    --nRetries;
    await sleep(2000);
  }
  if (nRetries === 0) throw Error("/api/readiness was not OK");

  nRetries = 20;
  while (nRetries > 0 && !(await hasLoginReady(baseUrl))) {
    --nRetries;
    await sleep(5000);
  }
  if (nRetries === 0) throw Error("user login was not OK");

  return null;
}

async function readExcelSheet({ index, file }) {
  if (fs.existsSync(file)) {
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(file);
    return workbook.worksheets[index]["name"];
  }

  return null;
}

async function deleteFile(file) {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    return true;
  }
  return false;
}

async function checkFileExists({ file, timeout }) {
  let nRetries = 20;
  while (nRetries > 0 && !fs.existsSync(file)) {
    --nRetries;
    await sleep(timeout);
  }
  if (nRetries === 0) throw Error("file was not downloaded successfully");

  return true;
}
async function modifyHash({ pathToFile, newHash, newBackup }) {
  let success = false;
  await checkFileExists({ file: pathToFile, timeout: 500 });
  const extractPath = `/tmp/backup${Date.now()}`;
  const metadataPath = `${extractPath}/metadata.yml`;
  const unTARer = rawTar.extract();
  const filePath = pathToFile.substring(0, pathToFile.lastIndexOf("/"));

  unTARer.on("error", err => {
    console.log(err.message);
    unTARer.destroy();
    return success;
  });
  const extract = tar.extract(extractPath, { extract: unTARer });
  const file = fs.createReadStream(pathToFile);
  const stream = file.pipe(extract);

  stream.on("finish", async () => {
    const config = loadConfig(metadataPath);
    await updateMetadataFile(config, newHash, metadataPath);
    tar.pack(extractPath).pipe(fs.createWriteStream(`${filePath}/${newBackup}`));
    return success;
  });
  return checkFileExists({ file: `${filePath}/${newBackup}`, timeout: 500 });
}
const loadConfig = path => {
  const config = yaml.safeLoad(fs.readFileSync(path, "utf8"));
  shell.rm(path);
  return config;
};

const updateMetadataFile = async (config, newHash, metadataPath) => {
  shell.touch(metadataPath);
  const ts = Date.now();
  const organisation = config.hasOwnProperty("Organisation") ? `\nOrganisation: ${config.Organisation}` : "";
  shell
    .echo(`ChainName: ${config.ChainName}${organisation}\nTimestamp: ${ts}\nDirectoryHash: ${newHash}\n`)
    .to(metadataPath);
  return config;
};

module.exports = (on, config) => {
  on("task", {
    awaitApiReady: awaitApiReady,
    readExcelSheet: readExcelSheet,
    deleteFile: deleteFile,
    checkFileExists: checkFileExists,
    modifyHash: modifyHash,
    log(message) {
      console.log(message);
      return null;
    }
  });
  on("before:browser:launch", (browser, options) => {
    const downloadDirectory = path.join(__dirname, "..", "fixtures");

    if (browser.family === "chromium" && browser.name !== "electron") {
      options.preferences.default["download"] = { default_directory: downloadDirectory };

      return options;
    }
  });
  config = dotenvPlugin(config);
  return config;
};
