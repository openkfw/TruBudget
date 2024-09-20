"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMarkdownFile = exports.extractSchemaInfo = void 0;
const fs_1 = require("fs");
// Helper function to extract Joi schema information
const extractSchemaInfo = (schema) => {
    const envVariables = [];
    const schemaDescribe = schema.describe();
    // Iterate over schema keys
    if (schemaDescribe.keys) {
        Object.keys(schemaDescribe.keys).forEach((key) => {
            var _a, _b;
            const item = schemaDescribe.keys[key];
            const isRequired = item.flags && item.flags.presence === "required" ? "yes" : "no";
            const defaultValue = item.flags && item.flags.default ? item.flags.default : "-";
            const description = item.notes && item.notes.length ? item.notes.join(" ") : "-";
            const additionalEntries = [];
            const min = item.rules && item.rules.find((rule) => rule.name === "min");
            const max = item.rules && item.rules.find((rule) => rule.name === "max");
            const invalid = item.invalid;
            const deprecated = item.notes && item.notes.find((note) => note === "deprecated");
            const examples = item.examples;
            const valid = item.allow;
            if (min) {
                additionalEntries.push(`Minimal value: ${(_a = min === null || min === void 0 ? void 0 : min.args) === null || _a === void 0 ? void 0 : _a.limit}.`);
            }
            if (max) {
                additionalEntries.push(`Maximal value: ${(_b = max === null || max === void 0 ? void 0 : max.args) === null || _b === void 0 ? void 0 : _b.limit}.`);
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
exports.extractSchemaInfo = extractSchemaInfo;
// Generate Markdown table
const generateMarkdown = (envVariables) => {
    const header = "| Env Variable name | Required | Default Value | Description |\n|------------------|----------------------|---------------|-------------|\n";
    const rows = envVariables
        .map((varInfo) => `| **${varInfo.name}**${varInfo.deprecated ? " `deprecated`" : ""} | ${varInfo.required} | ${varInfo.default} | ${varInfo.description} |`)
        .join("\n");
    return header + rows;
};
const updateMarkdownFile = (envVarsSchema) => {
    const schema = (0, exports.extractSchemaInfo)(envVarsSchema);
    const mdTable = generateMarkdown(schema);
    (0, fs_1.writeFileSync)("../../environment-variables2.md", mdTable, "utf-8");
};
exports.updateMarkdownFile = updateMarkdownFile;
//# sourceMappingURL=index.js.map