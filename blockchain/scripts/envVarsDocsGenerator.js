const { writeFileSync } = require("fs");
const { generateMarkdownFile } = require("../../scripts/common/envVarsGenerator/dist");
const { envVarsSchema } = require("../src/envVarsSchema");

function updateReadme() {
  const mdTable = generateMarkdownFile(envVarsSchema);

  const md = `# Trubudget Blockchain

## Environment Variables

Depending on the Trubudget setup environment variables

${mdTable}

## Connected services

### Email-Service

The email-service can be configured via the following environment variables.
To get started have a look at dedicated [documentation](../email-notification-service/README.md)
`;

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
