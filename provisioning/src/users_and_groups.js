const { readJsonFile } = require("./files");
const {
  createUser,
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  grantAllPermissionsToUser
} = require("./api");

const provisionUsers = async (axios, folder, organization) => {
  try {
    const users = readJsonFile(folder + "users.json");
    for (const user of users) {
      console.log(`~> Adding user ${user.displayName}`);
      await createUser(axios, user, organization);
    }

    await grantAllPermissionsToUser(axios, "mstein");
    console.log("~> all Permissions granted to mstein");

    await grantAllPermissionsToUser(axios, "jdoe");
    console.log("~> all Permissions granted to jdoe");
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      console.log("Failed to provision users, max retries exceeded");
    } else {
      console.log(
        `The following error occured during user provisioning ${err.message}`
      );
    }
  }
};

const provisionGroups = async (axios, folder) => {
  try {
    const users = readJsonFile(folder + "users.json");
    const groups = readJsonFile(folder + "groups.json");
    for (const group of groups) {
      console.log(`~> Adding group ${group.displayName}`);
      await createGroup(axios, group);
    }

    console.log("~> Adding user jxavier to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "jxavier");
    console.log("~> Adding user pkleffmann to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "pkleffmann");
    console.log("~> Adding user dviolin to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "mstein");
    console.log("~> Adding user mstein to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "dviolin");
    console.log("~> Removing user dviolin from group 'Reviewers'");
    await removeUserFromGroup(axios, "reviewers", "dviolin");
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      console.log("Failed to provision groups, max retries exceeded");
    } else {
      console.log(
        `The following error occured during user provisioning ${err.message}`
      );
    }
  }
};

module.exports = {
  provisionUsers,
  provisionGroups
};
