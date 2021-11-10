const { readJsonFile } = require("./files");
const {
  createUser,
  createGroup,
  addUserToGroup,
  removeUserFromGroup,
  grantAllPermissionsToUser,
} = require("./api");
const log = require("./logger");

const provisionUsers = async (axios, folder, organization) => {
  try {
    const users = readJsonFile(folder + "users.json");
    for (const user of users) {
      log.info(`~> Adding user ${user.displayName}`);
      await createUser(axios, user, organization);
    }

    await grantAllPermissionsToUser(axios, "mstein");
    log.info("~> all Permissions granted to mstein");

    await grantAllPermissionsToUser(axios, "jdoe");
    log.info("~> all Permissions granted to jdoe");
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      log.info("Failed to provision users, max retries exceeded");
    } else {
      log.info(
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
      log.info(`~> Adding group ${group.displayName}`);
      await createGroup(axios, group);
    }

    log.info("~> Adding user jxavier to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "jxavier");
    log.info("~> Adding user pkleffmann to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "pkleffmann");
    log.info("~> Adding user dviolin to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "mstein");
    log.info("~> Adding user mstein to group 'Reviewers'");
    await addUserToGroup(axios, "reviewers", "dviolin");
    log.info("~> Removing user dviolin from group 'Reviewers'");
    await removeUserFromGroup(axios, "reviewers", "dviolin");
  } catch (err) {
    if (err.code && err.code === "MAX_RETRIES") {
      log.info("Failed to provision groups, max retries exceeded");
    } else {
      log.info(
        `The following error occured during user provisioning ${err.message}`
      );
    }
  }
};

module.exports = {
  provisionUsers,
  provisionGroups,
};
