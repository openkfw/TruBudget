import axios from "axios";
import * as fs from "fs";
import {readFile} from "fs/promises";
import {extract, pack} from "tar-fs";

import {createUser, disableUser, getApiInstanceForUser, listUsers,} from "./apiHelper";
import ApplicationConfiguration from "./config";

const TEMP_WALLET_FILE_NAME = "wallet.gz";
const ARCHIVE_SUFFIX = ".gz"; //this is funny, backup has a gz suffix but is a tar ...

export const configureDestinationChain = async (): Promise<void> => {
  await extractWallet(ApplicationConfiguration.BACKUP_FILE_LOCATION);

  const file = await readFile(`./${TEMP_WALLET_FILE_NAME}`);
  const config = {
    headers: {"content-type": "application/gzip"},
    maxContentLength: 1074790400,
    maxBodyLength: 1074790400,
  };
  console.log(
    `Restoring wallet by sending post request to ${ApplicationConfiguration.DESTINATION_BLOCKCHAIN_BASE_URL}/restoreWallet`
  );
  const restoreWalletRequest = await axios.post(
    `${ApplicationConfiguration.DESTINATION_BLOCKCHAIN_BASE_URL}/restoreWallet`,
    file,
    config
  );
  if (restoreWalletRequest.status !== 200) {
    throw new Error("Can not restore wallet on destination chain!");
  }
  fs.unlinkSync(`./${TEMP_WALLET_FILE_NAME}`);
  console.log("Available wallet addresses are", restoreWalletRequest.data);
};

const extractWallet = async (path: string) => {
  const outDir = path.replace(ARCHIVE_SUFFIX, "");
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path).pipe(extract(outDir));
    console.log("Extract wallet...");
    stream.on("finish", async () => {
      pack(outDir, {
        entries: ["params.dat", "params.dat.bak", "wallet.dat", "wallet"], // only the specific entries will be packed
        ignore: function (name) {
          return name.includes("uncsend"); // ignore .bin files when packing
        },
      })
        .pipe(fs.createWriteStream(`./${TEMP_WALLET_FILE_NAME}`))
        .on("finish", () => {
          fs.rmSync(path.replace(ARCHIVE_SUFFIX, ""), {recursive: true});
          console.log("wallet extracted.");
          resolve(true);
        })
        .on("error", () => reject());
    });
  });
};

export const createMigrationUser = async (): Promise<void> => {
  const rootApi = await getApiInstanceForUser(
    "root",
    ApplicationConfiguration.ROOT_SECRET_DESTINATION
  );
  const users = await listUsers(rootApi);
  const migrationUser = users.find(
    (u) => u.username == ApplicationConfiguration.MIGRATION_USER_USERNAME
  );
  if (!migrationUser) {
    await createUser(
      rootApi,
      ApplicationConfiguration.MIGRATION_USER_USERNAME,
      ApplicationConfiguration.ORGANIZATION,
      ApplicationConfiguration.MIGRATION_USER_USERNAME,
      ApplicationConfiguration.MIGRATION_USER_PASSWORD
    );
  }
};

export const disableMigrationUser = async (): Promise<void> => {
  const rootApi = await getApiInstanceForUser(
    "root",
    ApplicationConfiguration.ROOT_SECRET_DESTINATION
  );
  const users = await listUsers(rootApi);
  const migrationUser = users.find(
    (u) => u.username == ApplicationConfiguration.MIGRATION_USER_USERNAME
  );

  if (!migrationUser)
    throw new Error(
      "Can not disable user - no migration user found on destination!"
    );

  await disableUser(rootApi, migrationUser.userId);
};
