import { danger, warn } from "danger";
const { includes } = require("lodash");

const apiSources = danger.git.fileMatch("api/src/**/*.ts");
const blockchainSources = danger.git.fileMatch("blockchain/src/*");
const frontendSources = danger.git.fileMatch("frontend/src/*");
const provisioningSources = danger.git.fileMatch("provisioning/src/*");
const e2eTestSources = danger.git.fileMatch("e2e-test/cypress/*");

const title = danger.github.pr.title.toLowerCase();
const trivialPR = title.includes("refactor");
const changelogChanges = includes(danger.git.modified_files, "CHANGELOG.md");

// When there are app-changes and it's not a PR marked as trivial, expect there to be CHANGELOG changes.
if (
  (apiSources.modified ||
    blockchainSources.modified ||
    frontendSources.modified ||
    provisioningSources.modified ||
    e2eTestSources.modified) &&
  !trivialPR &&
  !changelogChanges
) {
  warn("No CHANGELOG added.");
}
