import { writeFileSync } from "fs";
import { generateMarkdownFile } from "env-vars-generator/dist";
import { envVarsSchema } from "../envVarsSchema";

function updateReadme(): void {
  const mdTable = generateMarkdownFile(envVarsSchema);

  const md = `# TruBudget-API

## Environment variables

${mdTable}`;

  writeFileSync("./environment-variables.md", md, "utf-8");
}

updateReadme();
