import { writeFileSync } from "fs";
import { generateMarkdownFile } from "../../scripts/common/envVarsGenerator/dist";
import { envVarsSchema } from "../src/envVarsSchema";

function updateReadme(): void {
  // read arguments from the command line
  const args = process.argv.slice(2);

  const options = {};
  if (args.includes("--add-service-name-column")) {
    options["serviceNameColumn"] = "Storage Service";
  }

  if (args.includes("--skip-table-header")) {
    options["skipTableHeader"] = true;
  }

  const mdTable = generateMarkdownFile(envVarsSchema, options);

  const md = args.includes("--skip-text")
    ? mdTable
    : `# Trubudget Storage service

## Environment Variables

To ensure all necessary environment variables are set correctly this section describes all environment variables across
all services.

${mdTable}
`;

  if (args.includes("--output-table")) {
    console.log(md);
    return;
  }

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
