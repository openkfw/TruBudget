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

require("dotenv").config();

function apiReportsReadiness(baseUrl) {
  return axios
    .get(`${baseUrl}/api/readiness`)
    .then(response => {
      if (response.status === 200) {
        console.log("API reports readiness!");
        return true;
      } else {
        console.log(`API is not ready yet and responded with: ${JSON.stringify(response)}`);
        return false;
      }
    })
    .catch(err => {
      console.log(`API is not ready yet: ${err}`);
      return false;
    });
}

function excelExportReportsReadiness(exportServiceBaseUrl) {
  return axios
    .get(`${exportServiceBaseUrl}/readiness`)
    .then(response => {
      if (response.status === 200) {
        console.log("Excel-Export-Service reports readiness!");
        return true;
      } else {
        console.log(`Excel-Export-Service is not ready yet and responded with: ${JSON.stringify(response)}`);
        return false;
      }
    })
    .catch(err => {
      console.log(`Excel-Export-Service is not ready yet: ${err}`);
      return false;
    });
}

function isProvisioned(baseUrl) {
  return axios
    .post(`${baseUrl}/api/user.authenticate`, {
      apiVersion: "1.0",
      data: {
        user: {
          id: "root",
          password: process.env.CYPRESS_ROOT_SECRET
        }
      }
    })
    .then(response => {
      /*
      response.headers["set-cookie"][0] => "token={JWT_Token}; Path=/; HttpOnly; Secure; SameSite=Strict"
      response.headers["set-cookie"][0].split(";")[0] => "token={JWT_Token}"
      response.headers["set-cookie"][0].split(";")[0].replace("token=", "") => "{JWT_Token}"
      */
      let cookie = response.headers["set-cookie"][0];
      let JWTtoken = response.headers["set-cookie"][0].split(";")[0].replace("token=", "");

      return axios
        .get(`${baseUrl}/api/provisioned`, {
          headers: {
            Authorization: "Bearer " + JWTtoken,
            Cookie: cookie
          }
        })
        .then(response => {
          if (response.data.data.isProvisioned) {
            console.log("Trubudget is provisioned.");
            return true;
          } else {
            console.log(`Trubudget is not provisioned: ${response.data.data.message}`);
            return false;
          }
        })
        .catch(err => {
          console.error(`Failed to GET ${baseUrl}/api/provisioned: ${err}`);
          return false;
        });
    })
    .catch(err => {
      console.log(`Authentication failed err: ${err}`);
      return false;
    });
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

async function awaitApiReady(baseUrl, retries = 10, timeout = 2000) {
  let nRetries = retries;
  while (nRetries > 0 && !(await apiReportsReadiness(baseUrl))) {
    --nRetries;
    await sleep(2000);
  }
  if (nRetries === 0) {
    throw Error(`API is not ready/connected after ${retries} retries with ${timeout / 1000} seconds timeout`);
  }
  return null;
}

async function awaitExcelExportReady(exportServiceBaseUrl, retries = 10, timeout = 2000) {
  let nRetries = retries;
  while (nRetries > 0 && !(await excelExportReportsReadiness(exportServiceBaseUrl))) {
    --nRetries;
    await sleep(timeout);
  }
  if (nRetries === 0) {
    throw Error(`Excel Export is not ready/connected after ${retries} retries with ${timeout / 1000} seconds timeout`);
  }
  return null;
}

async function awaitProvisioning(baseUrl, retries = 10, timeout = 20000) {
  let nRetries = retries;
  while (nRetries > 0 && !(await isProvisioned(baseUrl))) {
    --nRetries;
    await sleep(timeout);
  }
  if (nRetries === 0) {
    throw Error(`Provisioning is not ready after ${retries} retries with ${timeout / 1000} seconds timeout`);
  }
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
  require("cypress-mochawesome-reporter/plugin")(on);
  on("task", {
    awaitApiReady: awaitApiReady,
    awaitExcelExportReady: awaitExcelExportReady,
    awaitProvisioning: awaitProvisioning,
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
  config.env = {
    BASE_URL: process.env.CYPRESS_BASE_URL,
    API_BASE_URL: process.env.CYPRESS_API_BASE_URL,
    ROOT_SECRET: process.env.CYPRESS_ROOT_SECRET,
    EXPORT_SERVICE_BASE_URL: process.env.CYPRESS_EXPORT_SERVICE_BASE_URL
  };
  return config;
};
