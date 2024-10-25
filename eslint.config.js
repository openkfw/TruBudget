import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: globals.node
    },
    files: ["*.js"],
    rules: {
      "prefer-const": error,
      "no-undef": warn,
      "no-unused-var": warn
    }
  }
];
