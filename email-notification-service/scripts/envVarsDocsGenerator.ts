import { writeFileSync } from "fs";
import { generateMarkdownFile } from "../../scripts/common/envVarsGenerator/dist";
import { envVarsSchema } from "../src/envVarsSchema";

function updateReadme(): void {
  const mdTable = generateMarkdownFile(envVarsSchema);

  const md = `# Trubudget Email Service

## Environment Variables

${mdTable}

#### JWT_SECRET

The JWT_SECRET is shared between Trubudget's blockchain api and email-service. The endpoints of the email-service can
only be used by providing a valid JWT_TOKEN signed with this JWT_SECRET. Since the blockchain is using the notification
endpoints and the ui is using the user endpoints the secret has to be shared.
`;

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
