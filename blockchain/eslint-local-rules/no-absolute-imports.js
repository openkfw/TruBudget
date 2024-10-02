const fs = require("fs");
const path = require("path");

module.exports = {
  meta: {
    type: "problem", // Defines this as a warning
    docs: {
      description: "Warn about absolute imports not listed in package.json",
      category: "Best Practices",
      recommended: false,
    },
    schema: [], // No options for now
  },

  create(context) {
    const filePath = path.resolve(context.getCwd(), "package.json");
    let packageJsonDeps = {};

    // Read package.json to get the list of dependencies
    try {
      const packageJson = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      packageJsonDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
        ...packageJson.peerDependencies,
        ...packageJson.optionalDependencies,
      };
    } catch (error) {
      context.report({
        message: `Could not read package.json: ${error.message}`,
      });
    }

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;
        const isAbsoluteImport = !importSource.startsWith("./") && !importSource.startsWith("../");
        const importSourceLibNameFromPath = importSource.split("/")[0];
        const isPackageIncluded =
          Object.keys(packageJsonDeps).includes(importSource) ||
          Object.keys(packageJsonDeps).includes(importSourceLibNameFromPath);
        const isPackageACommonJsModule = ["fs", "path", "child_process"].includes(importSource);

        if (isAbsoluteImport && !isPackageIncluded && !isPackageACommonJsModule) {
          context.report({
            node,
            message: `The import "${importSource}" is not listed in your package.json.`,
          });
        }
      },
    };
  },
};
