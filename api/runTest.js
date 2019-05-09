const execSync = require("child_process").execSync;

const arg = process.argv[2];
const arg2 = process.argv[3];

if (!arg) {
  console.error(
    "Error: first argument needs to be the name of the file(s) under test (e.g. npm run test:here subproject_projected_budget_delete)",
  );
  process.exit(1);
}

if (!arg2) {
  console.log(
    "Hint: you can grep for a certain test using the second argument (e.g. npm run test:here subproject_projected_budget_delete notification)",
  );
}

const cli1 = `dist/**/*${arg.toLowerCase()}*.spec.js`;
const cli2 = arg2 ? `--grep ${arg2}` : "";

execSync(`npm run build && mocha ${cli1} ${cli2}`, {
  stdio: "inherit",
});
