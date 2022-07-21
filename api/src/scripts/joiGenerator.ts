/* eslint-disable @typescript-eslint/no-explicit-any */
import * as colors from "colors";
import * as Diff from "diff";
import * as fs from "fs";
import * as parseSwagger from "swagger-to-joi";

const fastifyMock = {
  authenticate: "",
};

const overrideKeys = {
  projectId: "Project.idSchema.required()",
  additionalData: "AdditionalData.schema",
  currencyCode: "currencyCodeSchema.required()",
};

const extractVariable = (text: string, variableName: string) => {
  let extractedText = "";
  let curlyCount = 0;
  let curlyTotalCount = 0;
  let bracketCount = 0;
  let bracketTotalCount = 0;
  let start = false;
  const BreakException = {};
  let breakCycle = false;
  let isFunction = false;

  const regex = new RegExp(`let|const|var\\s+${variableName}\\s+=\\s+`, "i");
  let variablePosition = text.search(regex);

  if (variablePosition === -1) {
    const functionRegex = new RegExp(`function\\s+${variableName}\\s?(`, "i");
    variablePosition = text.search(functionRegex);
    isFunction = true;
  }
  const fnStart = text.slice(variablePosition);

  try {
    [...fnStart].forEach((c) => {
      switch (c) {
        case "{":
          curlyCount += 1;
          curlyTotalCount += 1;
          start = true;
          break;
        case "}":
          curlyCount -= 1;
          break;
        case "(":
          bracketCount += 1;
          bracketTotalCount += 1;
          start = true;
          break;
        case ")":
          bracketCount -= 1;
          break;
        default:
      }

      if (breakCycle === true && c.search(/\S/) !== -1) {
        breakCycle = false;
      }

      if (breakCycle !== true || c === ";") {
        extractedText += c;
      }

      if (breakCycle === true) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw BreakException;
      }

      if (
        start &&
        curlyCount === 0 &&
        bracketCount === 0 &&
        !(isFunction && curlyTotalCount === 0 && bracketTotalCount === 1)
      ) {
        breakCycle = true;
      }
    });
  } catch (e) {
    if (e !== BreakException) throw e;
  }

  return extractedText;
};

const generate = () => {
  const args = process.argv.slice(2);

  let fileName = "";
  let replace = false;
  if (args) {
    args.forEach((arg) => {
      if (arg === "r" || arg === "R" || arg === "rewrite") {
        replace = true;
      } else {
        fileName = arg;
      }
    });
  }

  if (fileName.length === 0) {
    throw Error("filename not specified. Run e.g.: npm run generate project_create.ts");
  }

  const filePath = `./src/${fileName}`;
  const fileContent = fs.readFileSync(filePath, "utf8");

  // eslint-disable-next-line global-require
  const { mkSwaggerSchema } = require(`../${fileName.replace(".ts", "")}`);

  if (!mkSwaggerSchema) {
    console.error(`File ${fileName} doesn't have exported function mkSwaggerSchema.
    Try adding "export function mkSwaggerSchema" to the file.`);

    return;
  }

  const swagger = mkSwaggerSchema(fastifyMock as any);
  const joi = parseSwagger(swagger.schema, undefined, "2.0", { singleQuote: false, overrideKeys });

  const found = extractVariable(fileContent, "requestBodyV1Schema");

  const diff = Diff.diffChars(`${found}`, `const requestBodyV1Schema = ${joi.body};`);

  diff.forEach((part) => {
    // green for additions, red for deletions
    // grey for common parts
    // eslint-disable-next-line no-nested-ternary
    const color = part.added ? "green" : part.removed ? "red" : "grey";
    const rightColor = colors[color];
    process.stderr.write(rightColor(part.value));
  });

  if (replace) {
    const newFileContent = fileContent.replace(
      `${found}`,
      `const requestBodyV1Schema = ${joi.body};`,
    );

    fs.writeFileSync(filePath, newFileContent);
  }
};

generate();
