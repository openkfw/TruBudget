import { readFile } from "fs/promises";
import ApplicationConfiguration from "./config";
import axios from "axios";
import {
  createUser,
  disableUser,
  getApiInstanceForUser,
  listUsers,
} from "./apiHelper";

export const configureDestinationChain = async (): Promise<void> => {
  const file = await readFile(ApplicationConfiguration.BACKUP_FILE_LOCATION);
  const config = {
    headers: { "content-type": "application/gzip" },
    maxContentLength: 1074790400,
    maxBodyLength: 1074790400,
  };
  const restoreWalletRequest = await axios.post(
    `${ApplicationConfiguration.DESTINATION_BLOCKCHAIN_BASE_URL}/restoreWallet`,
    file,
    config
  );
  if (restoreWalletRequest.status !== 200) {
    throw new Error("Can not restore wallet on destination chain!");
  }

  console.log("Available wallet addresses are", restoreWalletRequest.data);
};

export const createMigrationUser = async (): Promise<void> => {
  const rootApi = await getApiInstanceForUser(
    "root",
    ApplicationConfiguration.ROOT_SECRET
  );
  await createUser(
    rootApi,
    ApplicationConfiguration.MIGRATION_USER_USERNAME,
    ApplicationConfiguration.ORGANIZATION,
    ApplicationConfiguration.MIGRATION_USER_USERNAME,
    ApplicationConfiguration.MIGRATION_USER_PASSWORD
  );
};

export const disableMigrationUser = async (): Promise<void> => {
  const rootApi = await getApiInstanceForUser(
    "root",
    ApplicationConfiguration.ROOT_SECRET
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
