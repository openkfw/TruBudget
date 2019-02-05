const execSync = require("child_process").execSync;

const arg = process.argv[2];
const arg2 = process.argv[3];

if (!arg) {
  console.error(
    "Error: first argument needs to be the name of the context under test (e.g. npm run test:here project)",
  );
  process.exit(1);
}

if (!arg2) {
  console.log(
    "Hint: you can filter for a certain test using the second argument (e.g. npm run test:here project Assigning)",
  );
}

const cli1 = `dist/${arg.toLowerCase()}/*.spec.js`;
const cli2 = arg2 ? `--grep ${arg2}` : "";

execSync(`npm run build && nyc mocha ${cli1} ${cli2}`, { stdio: "inherit" });
