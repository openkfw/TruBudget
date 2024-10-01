import * as Joi from "joi";

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

      let isRequired = item.flags && item.flags.presence === "required" ? "yes" : "no";
      
      const defaultValue = item.flags && item.flags.default ? item.flags.default : "-";
      const description = item.notes && item.notes.length ? item.notes.join(" ") : "-";
      const additionalEntries: string[] = [];

      const min = item.rules && item.rules.find((rule) => rule.name === "min");
      const max = item.rules && item.rules.find((rule) => rule.name === "max");
      const invalid = item.invalid;
      const deprecated = item.notes && item.notes.find((note) => note === "deprecated");
      const examples = item.examples;
      const valid = item.allow;
      const port = item.rules && item.rules.find((rule) => rule.name === "port");

      if (item.whens) {
        item.whens.forEach(when => {
          // conditional required
        if (isRequired !== "yes" && when.then?.flags?.presence === "required") {
          const relationSign = when.is?.flags?.only === true && when.is?.flags?.presence === "required" ? "=" : " ";
          isRequired = `yes (if ${when.ref?.path?.[0]}${relationSign}${when.is?.allow?.[1]})`
        }
        });
        
      }

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
      if (port) {
        additionalEntries.push("Value is a port with minimal value 0 and maximal value 65535");
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
  const table: string[][] = [];
  table.push(["Env Variable name", "Required", "Default Value", "Description"]);
  table.push(["---","---","---","---"]);
  envVariables
    .forEach(
      (varInfo: EnvVariable) => {
        table.push([`**${varInfo.name}**${varInfo.deprecated ? " `deprecated`" : ""}`, `${
          varInfo.required
        }`, `${varInfo.default}`, `${varInfo.description}`])
      });

  // get max column length for each column
  const tableColumnsLength: number[] = [];
  table.forEach((row) => row.forEach((column, columnIndex) => {
    if (!tableColumnsLength[columnIndex] || tableColumnsLength[columnIndex] < column.length) {
      tableColumnsLength[columnIndex] = column.length;
    }
  }));

  const finalMarkdownTable = table.map(row => {
    const finalMarkdownRow = row.map((column, columnIndex) => {
      if (column === "---") {
        return "-".repeat(tableColumnsLength[columnIndex]);
      }
      return column + " ".repeat(tableColumnsLength[columnIndex] - column.length);
    });

    return `| ${finalMarkdownRow.join(" | ")} |`;
  });

  return finalMarkdownTable.join("\n");
};

export const generateMarkdownFile = (envVarsSchema) => {
  const schema = extractSchemaInfo(envVarsSchema);
  const mdTable = generateMarkdown(schema);

  return mdTable;
};

