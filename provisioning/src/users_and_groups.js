const { readJsonFile } = require("./files");
const {
  createUser,
  createGroup,
  addUserToGroup,
  grantAllPermissionsToUser,
  grantGlobalPermissionToUser,
  listUsers,
  listGroups,
} = require("./api");
const log = require("./logger");

const provisionUsers = async (axios, folder, organization) => {
  try {
    const users = readJsonFile(folder + "users.json");
    
    // get all existing users from TB
    const existingUsers = (await listUsers(axios)).map((user) => user.id);    
    // provision only the users that are not already in TB
    for (const user of users) {
      if (existingUsers.includes(user.id)) { 
        log.info(`~> User ${user.displayName} already exists, skipping creation`);
        continue;
      }
      // check if user already exists
      // if user exists, skip user creation, check for permissions?
      // log info if user already exists
      // if user does not exist, create user
      log.info(`~> Adding user ${user.displayName}`); 
      await createUser(axios, {id: user.id, displayName: user.displayName, password: user.password}, organization);

      if (user.permissions.length > 0) {
        if (user.permissions.includes("all")) {
          log.info(`~> all Permissions granted to ${user.id}`);
          await grantAllPermissionsToUser(axios, user.id);
        } 
        else {
          await Promise.all(user.permissions.map((intent) => { log.info(`~> Granting permission ${intent} to ${user.id}`); return grantGlobalPermissionToUser(axios, intent, user.id);}));
        }
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
    
    const existingGroups = await listGroups(axios);
    console.error("existingGroups", existingGroups);
    const existingGroupIds = existingGroups.map((group) => group.groupId);

    for (const group of groups) {
      if (existingGroupIds.includes(group.id)) {
        log.info(`~> Group ${group.displayName} already exists, skipping creation`);
        continue;
      }
      log.info(`~> Adding group ${group.displayName}`);
      await createGroup(axios, group);

      if ( group.users.length > 0)  {
        await Promise.all(group.users.map((user) => addUserToGroup(axios, group.id, user)));
      }
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
