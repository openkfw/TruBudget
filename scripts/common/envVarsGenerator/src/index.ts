import * as Joi from "joi";
import { writeFileSync } from "fs";

interface EnvVariable {
  name: string;
  required: string;
  default: string;
  deprecated: boolean;
  description: string;
}

// Helper function to extract Joi schema information
export const extractSchemaInfo = (schema: Joi.ObjectSchema) => {
  const envVariables: EnvVariable[] = [];

  const schemaDescribe = schema.describe();
  // Iterate over schema keys
  if (schemaDescribe.keys) {
    Object.keys(schemaDescribe.keys).forEach((key) => {
      const item = schemaDescribe.keys[key];

      const isRequired = item.flags && item.flags.presence === "required" ? "yes" : "no";
      const defaultValue = item.flags && item.flags.default ? item.flags.default : "-";
      const description = item.notes && item.notes.length ? item.notes.join(" ") : "-";
      const additionalEntries: string[] = [];

      const min = item.rules && item.rules.find((rule) => rule.name === "min");
      const max = item.rules && item.rules.find((rule) => rule.name === "max");
      const invalid = item.invalid;
      const deprecated = item.notes && item.notes.find((note) => note === "deprecated");
      const examples = item.examples;
      const valid = item.allow;

      if (min) {
        additionalEntries.push(`Minimal value: ${min?.args?.limit}.`);
      }
      if (max) {
        additionalEntries.push(`Maximal value: ${max?.args?.limit}.`);
      }
      if (invalid) {
        additionalEntries.push(`Invalid values: ${invalid.join(", ")}.`);
      }
      if (examples) {
        additionalEntries.push(`Example values: ${examples.join(", ")}.`);
      }
      if (valid) {
        additionalEntries.push(`Allowed values: ${valid.join(", ")}.`);
      }

      envVariables.push({
        name: key,
        required: isRequired,
        default: defaultValue,
        deprecated: !!deprecated,
        description: description.replace(/<br\/>/g, " ") + ` ${additionalEntries.join(" ")}`,
      });
    });
  }

  return envVariables;
};

// Generate Markdown table
const generateMarkdown = (envVariables: EnvVariable[]) => {
  const header =
    "| Env Variable name | Required | Default Value | Description |\n|------------------|----------------------|---------------|-------------|\n";
  const rows = envVariables
    .map(
      (varInfo: EnvVariable) =>
        `| **${varInfo.name}**${varInfo.deprecated ? " `deprecated`" : ""} | ${
          varInfo.required
        } | ${varInfo.default} | ${varInfo.description} |`,
    )
    .join("\n");

  return header + rows;
};

export const updateMarkdownFile = (envVarsSchema) => {
  const schema = extractSchemaInfo(envVarsSchema);
  const mdTable = generateMarkdown(schema);

  writeFileSync("../../environment-variables2.md", mdTable, "utf-8");
};

