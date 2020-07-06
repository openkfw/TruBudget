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
const excelExportSources = danger.git.fileMatch("excel-export/src/**/*");

const title = danger.github.pr.title.toLowerCase();
const trivialPR = title.includes("refactor");
const changelogChanges = includes(danger.git.modified_files, "CHANGELOG.md");
const frontendChanges =
  frontendRootSources.edited ||
  frontendPageSources.edited ||
  frontendLanguageSources.edited;

const apiResourceHasChanged = apiResourceChangesDetected();

function apiResourceChangesDetected() {
  const projectSource = danger.git.fileMatch(
    "api/src/service/domain/workflow/project.ts"
  );
  const subprojectSource = danger.git.fileMatch(
    "api/src/service/domain/workflow/subproject.ts"
  );
  const workflowitemSource = danger.git.fileMatch(
    "api/src/service/domain/workflow/workflowitem.ts"
  );
  if (
    projectSource.edited ||
    subprojectSource.edited ||
    workflowitemSource.edited
  ) {
    return true;
  } else {
    return false;
  }
}

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
  const { edited } = files.getKeyedPaths((paths) => paths);
  const chunksArray = await Promise.all(
    edited.map(async (path) => {
      const changes = await Promise.resolve(
        danger.git.structuredDiffForFile(path)
      );
      return changes;
    })
  );
  const chunks = deepFlat(chunksArray.map((chunk) => chunk.chunks));
  const changes = deepFlat(chunks.map((chunk) => chunk.changes));
  return changes;
}

function getContentByType(changes) {
  const additions = changes
    .filter((change) => change.add)
    .map((change) => change.content);
  const deletions = changes
    .filter((change) => change.del)
    .map((change) => change.content);
  const normal = changes
    .filter((change) => change.normal)
    .map((change) => change.content);
  return {
    additions,
    deletions,
    normal,
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
(async function () {
  // Warn if there were console logs added in the API
  const apiChanges = await getChanges("api/**/*.ts");
  const { additions: apiAdditions } = getContentByType(apiChanges);

  if (apiAdditions.some((addition) => addition.includes("console.log"))) {
    warn("There are new console logs in the API!");
  }

  // Warn if there were only keyword added in the e2e-test
  const e2etestChanges = await getChanges("e2e-test/cypress/integration/*.js");
  const { additions: e2etestAdditions } = getContentByType(e2etestChanges);

  if (e2etestAdditions.some((addition) => addition.includes(".only"))) {
    warn("The '.only' keyword was added to the e2e-tests");
  }

  // Warn if there where properties added to a resource(project/subproject/workflowitem) and
  // excel-export is not adapted
  if (apiResourceHasChanged && !excelExportSources.edited) {
    warn(
      "One of the resource files in the api domain layer (project.ts/subproject.ts/workflowitem.ts) were edited. " +
        "If a new property was added the excel-export project has to be adapted."
    );
  }

  const allChanges = await getChanges("**/*");
  const { additions: allAdditions } = getContentByType(allChanges);

  // Warn if there was a TODO added in any file
  if (allAdditions.some((addition) => addition.includes("TODO"))) {
    warn("A new TODO was added.");
  }

  // Warn if there was an id added in any file
  const reg = /[a-z0-9]{8}[-][a-z0-9]{4}[-][a-z0-9]{4}[-][a-z0-9]{4}[-][a-z0-9]{12}/;
  if (allAdditions.some((addition) => reg.test(addition))) {
    warn("It looks like an ID was added. Please make sure it is not a secret.");
  }
})();
