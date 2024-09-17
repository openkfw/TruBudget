import Joi from "joi";
import { envVarsSchema } from "../envVarsSchema";

interface EnvVariable {
  name: string;
  required: string;
  default: string;
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
      if (item.min) {
        additionalEntries.push(`Minimal value: ${item.min}.`);
      }
      if (item.max) {
        additionalEntries.push(`Maximal value: ${item.max}.`);
      }
      if (item.invalid) {
        additionalEntries.push(`Invalid values: ${item.invalid}.`);
      }
      if (item.example) {
        additionalEntries.push(`Example values: ${item.example}.`);
      }
      if (item.valid) {
        additionalEntries.push(`Allowed values: ${item.valid}.`);
      }

      envVariables.push({
        name: key,
        required: isRequired,
        default: defaultValue,
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
        `| ${varInfo.name} | ${varInfo.required} | ${varInfo.default} | ${varInfo.description} |`,
    )
    .join("\n");

  return header + rows;
};

const updateMarkdownFile = () => {
  const schema = extractSchemaInfo(envVarsSchema);
  const mdTable = generateMarkdown(schema);

  console.log(mdTable);
};
