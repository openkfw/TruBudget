import { documentUploader } from "./customMigration/migrateDocuments";
import { makeProjectUploader } from "./customMigration/migrateWorkflowitems";
import ApplicationConfiguration from "./helper/config";
import { getAllStreams } from "./helper/migrationHelper";
import { CustomMigrations, migrate } from "./migrate";
import { StreamInfo } from "./types/stream";
import {
  configureDestinationChain,
  createMigrationUser,
  disableMigrationUser,
} from "./helper/configureDestination";
let migrationSource = require("multichain-node")({
  port: ApplicationConfiguration.SOURCE_RPC_PORT,
  host: ApplicationConfiguration.SOURCE_RPC_HOST,
  user: ApplicationConfiguration.SOURCE_RPC_USER,
  pass: ApplicationConfiguration.SOURCE_RPC_PASSWORD,
});

let migrationDestination = require("multichain-node")({
  port: ApplicationConfiguration.DESTINATION_RPC_PORT,
  host: ApplicationConfiguration.DESTINATION_RPC_HOST,
  user: ApplicationConfiguration.DESTINATION_RPC_USER,
  pass: ApplicationConfiguration.DESTINATION_RPC_PASSWORD,
});

const customMigrationFunctions: CustomMigrations = {};
customMigrationFunctions["offchain_documents"] = documentUploader;

(async function () {
  try {
    console.log("generate Project Migration Function...");
    await generateProjectMigrationFunction();
    console.log("configure Destination Chain...");
    await configureDestinationChain();
    console.log("create Migration User");
    await createMigrationUser();
    console.log("run Migration");
    await runMigration();
    console.log("disable Migration User");
    await disableMigrationUser();
    await listStreams();
  } catch (e) {
    console.log(e);
  }
})();

async function listStreams() {
  console.log(
    "Available streams on src are: ",
    ((await getAllStreams(migrationSource)) || []).map(
      (e: StreamInfo) => e.name
    )
  );

  console.log(
    "Available streams on dest are: ",
    ((await getAllStreams(migrationDestination)) || []).map(
      (e: StreamInfo) => e.name
    )
  );
}

async function generateProjectMigrationFunction() {
  console.log(
    `Get projects of source stream ${ApplicationConfiguration.SOURCE_RPC_HOST}:${ApplicationConfiguration.SOURCE_RPC_PORT} ...`
  );
  const projectIds = await getProjectStreams(migrationSource);
  for (const projectId of projectIds) {
    customMigrationFunctions[projectId] = makeProjectUploader(projectId);
  }
}

async function getProjectStreams(multichain): Promise<string[]> {
  const streams = await getAllStreams(multichain);
  const projects = streams
    .filter((el) => el.details.kind === "project")
    .map((el) => el.name);
  return projects;
}

async function runMigration() {
  await migrate(
    migrationSource,
    migrationDestination,
    ["org:MySlaveOrga"],
    customMigrationFunctions
  );
}
