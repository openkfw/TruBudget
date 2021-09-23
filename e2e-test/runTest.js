const fs = require("fs");
const execSync = require("child_process").execSync;

const arg = process.argv[2];
const uiPort = process.argv[3] || 3000;
const apiPort = process.argv[4];
const excelPort = process.argv[5];

if (!arg || arg === "-h" || arg === "--help") {
  console.error(
    "Usage: \n" +
      "1. Argument needs to be a word which is contained by a filename under cypress/integration \n" +
      "2. Argument is the frontend port \n" +
      "3. Argument is the api port \n" +
      "3. Argument is the excel-export port \n" +
      "\n" +
      "Example: npm run e2etest:here assign 3000 8080 8888) \n"
  );
  process.exit(0);
}

let files = fs.readdirSync("./cypress/integration");
files = files.map(filename => "cypress/integration/" + filename);
const filteredFiles = files.filter(filename => filename.includes(arg));

if (filteredFiles.length === 0) {
  console.warn(`Warning: No files found including "${arg}"`);
  process.exit(0);
}

console.info("Info: Following files will be tested: ");
console.info(filteredFiles);
let execCommand = `cypress run --spec "${filteredFiles}" --config baseUrl=http://localhost:${uiPort}`;
if (apiPort) execCommand = execCommand + `--env API_BASE_URL=http://localhost:${apiPort}`;
if (excelPort) execCommand = execCommand + `--env EXPORT_SERVICE_BASE_URL=http://localhost:${excelPort}`;
console.info(`\n ${execCommand}`);
execSync(execCommand, {
  stdio: "inherit"
});
