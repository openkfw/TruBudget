import { writeFileSync } from "fs";
import { generateMarkdownFile } from "../../scripts/common/envVarsGenerator/dist";
import { envVarsSchema } from "../src/envVarsSchema";

function updateReadme(): void {
  // read arguments from the command line
  const args = process.argv.slice(2);

  const options = {};
  if (args.includes("--add-service-name-column")) {
    options["serviceNameColumn"] = "Email notification service";
  }

  if (args.includes("--skip-table-header")) {
    options["skipTableHeader"] = true;
  }

  const mdTable = generateMarkdownFile(envVarsSchema, options);

  const md = args.includes("--skip-text")
    ? mdTable
    : `# Trubudget Email Service

## Environment Variables

${mdTable}

#### JWT_SECRET

The JWT_SECRET is shared between Trubudget's blockchain api and email-service. The endpoints of the email-service can
only be used by providing a valid JWT_TOKEN signed with this JWT_SECRET. Since the blockchain is using the notification
endpoints and the ui is using the user endpoints the secret has to be shared.
`;

  if (args.includes("--output-table")) {
    console.log(md);
    return;
  }

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
