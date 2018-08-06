const { readJsonFile } = require("./files");
const { createUser, grantGlobalPermissionToUser } = require("./api");
const provisionUsers = async (axios, folder, organization) => {
  try {
    const users = readJsonFile(folder + "users.json");
    for (const user of users) {
      console.log(`~> Adding user ${user.displayName}`);
      await createUser(axios, user, organization);
      await grantDefaultPermission(axios, user.id);
    }
    //Special permissions for mstein & jdoe
    await grantCreateProjectPermission(axios, "mstein");
    await grantUserCreatePermission(axios, "mstein");
    await grantNetworkViewPermissions(axios, "mstein");
    await grantNetworkVotePermissions(axios, "mstein");

    console.log("~> global Permissions granted for mstein");
    await grantCreateProjectPermission(axios, "jdoe");
    await grantNetworkViewPermissions(axios, "jdoe");
    console.log("~> global Permissions granted for jdoe");
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      console.log("Failed to provision users, max retries exceeded");
    }
  }
};

const grantDefaultPermission = async (axios, userId) => {
  await grantGlobalPermissionToUser(axios, "user.view", userId);
  await grantGlobalPermissionToUser(axios, "network.listActive", userId);
  return grantGlobalPermissionToUser(
    axios,
    "global.intent.listPermissions",
    userId
  );
};

const grantNetworkViewPermissions = async (axios, userId) => {
  await grantGlobalPermissionToUser(axios, `network.list`, userId);
};

const grantNetworkVotePermissions = async (axios, userId) => {
  await grantGlobalPermissionToUser(axios, `network.voteForPermission`, userId);
};

const grantCreateProjectPermission = async (axios, userId) => {
  return grantGlobalPermissionToUser(axios, "global.createProject", userId);
};

const grantUserCreatePermission = async (axios, userId) => {
  return grantGlobalPermissionToUser(axios, "global.createUser", userId);
};

module.exports = {
  provisionUsers
};
