const { writeFileSync } = require("fs");
const { generateMarkdownFile } = require("../../scripts/common/envVarsGenerator/dist");
const { envVarsSchema } = require("../src/envVarsSchema");

function updateReadme() {
  // read arguments from the command line
  const args = process.argv.slice(2);

  const options = {};
  if (args.includes("--add-service-name-column")) {
    options.serviceNameColumn = "Blockchain";
  }

  if (args.includes("--skip-table-header")) {
    options.skipTableHeader = true;
  }
  const mdTable = generateMarkdownFile(envVarsSchema, options);

  const md = args.includes("--skip-text")
    ? mdTable
    : `# Trubudget Blockchain

## Environment Variables

Depending on the Trubudget setup environment variables

${mdTable}

## Connected services

### Email-Service

The email-service can be configured via the following environment variables.
To get started have a look at dedicated [documentation](../email-notification-service/README.md)
`;

  if (args.includes("--output-table")) {
    console.log(md);
    return;
  }

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
