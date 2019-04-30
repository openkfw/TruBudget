import { danger, warn } from "danger";
const { includes } = require("lodash");

const docs = danger.git.fileMatch("**/*.md");
const apiFiles = danger.git.fileMatch("api/src/**/*.ts");
const blockchainFiles = danger.git.fileMatch("blockchain/src/*");
const frontendFiles = danger.git.fileMatch("frontend/src/*");
const provisioningFiles = danger.git.fileMatch("provisioning/src/*");
const e2eTestFiles = danger.git.fileMatch("e2e-test/cypress/*");

const title = danger.github.pr.title.toLowerCase();
const trivialPR = title.includes("#trivial");
const changelogChanges = includes(docs.modified_files, "CHANGELOG.md");

// When there are app-changes and it's not a PR marked as trivial, expect there to be CHANGELOG changes.

if (
  (apiFiles.modified ||
    blockchainFiles.modified ||
    frontendFiles.modified ||
    provisioningFiles.modified ||
    e2eTestFiles.modified) &&
  !trivialPR &&
  !changelogChanges
) {
  warn("No CHANGELOG added.");
}
