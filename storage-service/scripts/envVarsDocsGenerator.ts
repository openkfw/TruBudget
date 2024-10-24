import { writeFileSync } from "fs";
import { generateMarkdownFile } from "../../scripts/common/envVarsGenerator/dist";
import { envVarsSchema } from "../src/envVarsSchema";

function updateReadme(): void {
  const mdTable = generateMarkdownFile(envVarsSchema);

  const md = `# Trubudget Storage service

## Environment Variables

To ensure all necessary environment variables are set correctly this section describes all environment variables across
all services.

${mdTable}
`;

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
