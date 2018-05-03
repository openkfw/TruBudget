const { sleep } = require("./lib");

const users = [
  { id: "thouse", displayName: "Tom House", password: "test", organization: "Ministry of Health" },
  { id: "pkleffmann", displayName: "Piet Kleffmann", password: "test", organization: "ACMECorp" },
  { id: "mstein", displayName: "Mauro Stein", password: "test", organization: "UmbrellaCorp" },
  { id: "jdoe", displayName: "John Doe", password: "test", organization: "Ministry of Finance" },
  {
    id: "jxavier",
    displayName: "Jane Xavier",
    password: "test",
    organization: "Ministry of Education",
  },
  { id: "dviolin", displayName: "Dana Violin", password: "test", organization: "Centralbank" },
  { id: "auditUser", displayName: "Romina Checker", password: "test", organization: "Audit" },
];

const createUser = async (axios, user) => {
  await axios.post("/global.createUser", {
    user,
  });
};

export const provisionUsers = async axios => {
  try {
    for (const user of users) {
      await createUser(axios, user);
      await grantDefaultPermission(axios, user.id);
      console.log(`~> added User ${user.displayName}`);
    }
    // Special permissions for mstein
    await grantCreateProjectPermission(axios, "mstein");
    console.log("~> global Permissions granted for mstein");
  } catch (err) {
    handleError(axios, err);
  }
};

const grantDefaultPermission = async (axios, userId) => {
  await grantGlobalPermissionToUser(axios, "user.view", userId);
  return grantGlobalPermissionToUser(axios, "global.intent.listPermissions", userId);
};

const grantCreateProjectPermission = async (axios, userId) => {
  return grantGlobalPermissionToUser(axios, "global.createProject", userId);
};

const grantGlobalPermissionToUser = async (axios, intent, userId) => {
  return axios.post("/global.intent.grantPermission", { intent, userId });
};

const handleError = (axios, err) => {
  if (err.response && err.response.status === 409) {
    console.log("Seems like the users already exist");
  } else {
    throw err;
  }
};
