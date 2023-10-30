const { readJsonFile } = require("./files");
const {
  createUser,
  createGroup,
  addUserToGroup,
  grantAllPermissionsToUser,
  grantGlobalPermissionToUser,
} = require("./api");
const log = require("./logger");

const allowedIntents = [
  "global.listPermissions",
  "global.grantPermission",
  "global.grantAllPermissions",
  "global.revokePermission",
  "global.createProject",
  "global.createUser",
  "global.enableUser",
  "global.disableUser",
  "global.listAssignments",
  "global.createGroup",
  "network.registerNode",
  "network.list",
  "network.listActive",
  "network.voteForPermission",
  "network.approveNewOrganization",
  "network.approveNewNodeForExistingOrganization",
  "network.declineNode",
  "provisioning.start",
  "provisioning.end",
  "provisioning.get"
];

const provisionUsers = async (axios, folder, organization) => {
  try {
    const users = readJsonFile(folder + "users.json");

    await Promise.allSettled(users.map((user) => { log.info(`~> Adding user ${user.displayName}`); return createUser(axios, {id: user.id, displayName: user.displayName, password: user.password}, organization);}));
    const usersWithPermissions = users.filter((user) => Array.isArray(user.permissions) && user.permissions.length > 0);
    for (const user of usersWithPermissions) {
      if (user.permissions.includes("all")) {
        log.info(`~> all Permissions granted to ${user.id}`);
        await grantAllPermissionsToUser(axios, user.id);
      } 
      else {
        await Promise.allSettled(user.permissions.filter(intent => allowedIntents.includes(intent)).map((intent) => { log.info(`~> Granting permission ${intent} to ${user.id}`); return grantGlobalPermissionToUser(axios, intent, user.id);}));
      }
    }
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
    const groups = readJsonFile(folder + "groups.json");
    await Promise.allSettled(groups.map((group) => createGroup(axios, group)));
    const groupsWithUsers = groups.filter((group) => Array.isArray(group.users) && group.users.length > 0);
    for (const group of groupsWithUsers) {
      await Promise.allSettled(group.users.map((user) => addUserToGroup(axios, group.id, user)));
    }
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
