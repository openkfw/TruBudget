import { danger, warn } from "danger";
const { includes } = require("lodash");

const apiSources = danger.git.fileMatch("api/src/**/*.ts");
const blockchainSources = danger.git.fileMatch("blockchain/src/*");
const frontendRootSources = danger.git.fileMatch("frontend/src/*.*");
const frontendPageSources = danger.git.fileMatch("frontend/src/pages/**/*.js");
const frontendLanguageSources = danger.git.fileMatch(
  "frontend/src/languages/*"
);
const provisioningSources = danger.git.fileMatch("provisioning/src/**/*");
const e2eTestSources = danger.git.fileMatch("e2e-test/cypress/**/*");

const title = danger.github.pr.title.toLowerCase();
const trivialPR = title.includes("refactor");
const changelogChanges = includes(danger.git.modified_files, "CHANGELOG.md");
const frontendChanges =
  frontendRootSources.edited ||
  frontendPageSources.edited ||
  frontendLanguageSources.edited;

function deepFlat(inputArray) {
  return inputArray.reduce(
    (accumulator, value) =>
      Array.isArray(value)
        ? accumulator.concat(deepFlat(value))
        : accumulator.concat(value),
    []
  );
}

async function getChanges(filepath) {
  const files = danger.git.fileMatch(filepath);
  const { edited } = files.getKeyedPaths(paths => paths);
  const chunksArray = await Promise.all(
    edited.map(async path => {
      const changes = await Promise.resolve(
        danger.git.structuredDiffForFile(path)
      );
      return changes;
    })
  );
  const chunks = deepFlat(chunksArray.map(chunk => chunk.chunks));
  const changes = deepFlat(chunks.map(chunk => chunk.changes));
  return changes;
}

function getContentByType(changes) {
  const additions = changes
    .filter(change => change.add)
    .map(change => change.content);
  const deletions = changes
    .filter(change => change.del)
    .map(change => change.content);
  const normal = changes
    .filter(change => change.normal)
    .map(change => change.content);
  return {
    additions,
    deletions,
    normal
  };
}

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
  !e2eTestSources.edited &&
  !trivialPR
) {
  warn(
    "There were changes in the frontend, but no E2E-test was added or modified!"
  );
}

// Async part to check for changes in files
(async function() {
  // Warn if there were console logs added in the API
  const apiChanges = await getChanges("api/**/*.ts");
  const { additions: apiAdditions } = getContentByType(apiChanges);

  if (apiAdditions.some(addition => addition.includes("console.log"))) {
    warn("There are new console logs in the API!");
  }

  // Warn if there was a TODO added in any file
  const allChanges = await getChanges("**/*");
  const { additions: allAdditions } = getContentByType(allChanges);

  if (allAdditions.some(addition => addition.includes("TODO"))) {
    warn("A new TODO was added.");
  }
})();
