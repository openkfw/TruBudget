import { danger, warn } from "danger";
const { includes } = require("lodash");

const apiSources = danger.git.fileMatch("api/src/**/*.ts");
const blockchainSources = danger.git.fileMatch("blockchain/src/*");
const frontendRootSources = danger.git.fileMatch("frontend/src/*.*");
const frontendPageSources = danger.git.fileMatch("frontend/src/pages/*");
const frontendLanguageSources = danger.git.fileMatch("frontend/src/pages/*");
const provisioningSources = danger.git.fileMatch("provisioning/src/*");
const e2eTestSources = danger.git.fileMatch("e2e-test/cypress/*");

const title = danger.github.pr.title.toLowerCase();
const trivialPR = title.includes("refactor");
const changelogChanges = includes(danger.git.modified_files, "CHANGELOG.md");
const frontendChanges =
  frontendRootSources.edited ||
  frontendPageSources.edited ||
  frontendLanguageSources.edited;

// When there are app-changes and it's not a PR marked as trivial, expect there to be CHANGELOG changes.
if (
  (frontendChanges ||
    apiSources.edited ||
    blockchainSources.edited ||
    frontendRootSources.edited ||
    provisioningSources.edited ||
    e2eTestSources.edited) &&
  !trivialPR &&
  !changelogChanges
) {
  warn("No CHANGELOG added.");
}

// If there are changes in the UI (except language files)
// and PR is not marked as trivial, expect there to be E2E-test updates
if (
  (frontendRootSources.edited || frontendPageSources.edited) &&
  !e2eTestSources.modified &&
  !trivialPR
) {
  warn(
    "There were changes in the frontend, but no E2E-test was added or modified!"
  );
}
