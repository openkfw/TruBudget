"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMarkdownFile = exports.extractSchemaInfo = void 0;
// Helper function to extract Joi schema information
const extractSchemaInfo = (schema) => {
    const envVariables = [];
    const schemaDescribe = schema.describe();
    // Iterate over schema keys
    if (schemaDescribe.keys) {
        Object.keys(schemaDescribe.keys).forEach((key) => {
            var _a, _b;
            const item = schemaDescribe.keys[key];
            let isRequired = item.flags && item.flags.presence === "required" ? "yes" : "no";
            const defaultValue = item.flags && item.flags.default ? item.flags.default : "-";
            const description = item.notes && item.notes.length ? item.notes.join(" ") : "-";
            const additionalEntries = [];
            const min = item.rules && item.rules.find((rule) => rule.name === "min");
            const max = item.rules && item.rules.find((rule) => rule.name === "max");
            const invalid = item.invalid;
            const deprecated = item.notes && item.notes.find((note) => note === "deprecated");
            const examples = item.examples;
            const valid = item.valid;
            const port = item.rules && item.rules.find((rule) => rule.name === "port");
            if (item.whens) {
                item.whens.forEach(when => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    // conditional required
                    if (isRequired !== "yes" && ((_b = (_a = when.then) === null || _a === void 0 ? void 0 : _a.flags) === null || _b === void 0 ? void 0 : _b.presence) === "required") {
                        const relationSign = ((_d = (_c = when.is) === null || _c === void 0 ? void 0 : _c.flags) === null || _d === void 0 ? void 0 : _d.only) === true && ((_f = (_e = when.is) === null || _e === void 0 ? void 0 : _e.flags) === null || _f === void 0 ? void 0 : _f.presence) === "required" ? "=" : " ";
                        isRequired = `yes (if ${(_h = (_g = when.ref) === null || _g === void 0 ? void 0 : _g.path) === null || _h === void 0 ? void 0 : _h[0]}${relationSign}${(_k = (_j = when.is) === null || _j === void 0 ? void 0 : _j.allow) === null || _k === void 0 ? void 0 : _k[1]})`;
                    }
                });
            }
            if (min) {
                additionalEntries.push(`Minimal value: ${(_a = min === null || min === void 0 ? void 0 : min.args) === null || _a === void 0 ? void 0 : _a.limit}.`);
            }
            if (max) {
                additionalEntries.push(`Maximal value: ${(_b = max === null || max === void 0 ? void 0 : max.args) === null || _b === void 0 ? void 0 : _b.limit}.`);
            }
            if (invalid) {
                additionalEntries.push(`Invalid values: "${invalid.join("\", \"")}".`);
            }
            if (examples) {
                additionalEntries.push(`Example values: "${examples.join("\", \"")}".`);
            }
            if (valid) {
                additionalEntries.push(`Allowed values: "${valid.join("\", \"")}".`);
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
exports.extractSchemaInfo = extractSchemaInfo;
// Generate Markdown table
const generateMarkdown = (envVariables, options = {}) => {
    const table = [];
    if (!(options === null || options === void 0 ? void 0 : options.skipTableHeader)) {
        table.push(!(options === null || options === void 0 ? void 0 : options.serviceNameColumn) ?
            ["Env Variable name", "Required", "Default Value", "Description"] :
            ["Env Variable name", "Required", "Default Value", "Used By", "Description"]);
        table.push(!(options === null || options === void 0 ? void 0 : options.serviceNameColumn) ? ["---", "---", "---", "---"] : ["---", "---", "---", "---", "---"]);
    }
    envVariables
        .forEach((varInfo) => {
        table.push(!(options === null || options === void 0 ? void 0 : options.serviceNameColumn) ?
            [`**${varInfo.name}**${varInfo.deprecated ? " `deprecated`" : ""}`, `${varInfo.required}`, `${varInfo.default}`, `${varInfo.description}`] :
            [`**${varInfo.name}**${varInfo.deprecated ? " `deprecated`" : ""}`, `${varInfo.required}`, `${varInfo.default}`, (options === null || options === void 0 ? void 0 : options.serviceNameColumn) || "", `${varInfo.description}`]);
    });
    // get max column length for each column
    const tableColumnsLength = [];
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
const generateMarkdownFile = (envVarsSchema, options = {}) => {
    const schema = (0, exports.extractSchemaInfo)(envVarsSchema);
    const mdTable = generateMarkdown(schema, options);
    return mdTable;
};
exports.generateMarkdownFile = generateMarkdownFile;
//# sourceMappingURL=index.js.map