import { GlobalModel } from "./model";

export const getGlobalPermissionsForUser = async (multichain, userId) => {
  const globalPermissions = await multichain.latestValuesForKey("global", "_permissions");
  if (globalPermissions.length > 0) {
    const permissions = globalPermissions[0];
    const allowedIntents = Object.keys(permissions).map(key => {
      const intent = permissions[key].find(user => user === userId);
      if (intent) {
        return key;
      }
    });
    return allowedIntents.filter(intent => intent !== undefined);
  }
};
export const getGlobalPermissions = async multichain => {
  const permissions = await multichain.latestValuesForKey("global", "_permissions");
  return permissions[0];
};

export const mergePermissions = (requestedPermissions, existingPermissions) => {
  const permissions = Object.assign({}, existingPermissions);

  Object.keys(requestedPermissions).map(key => {
    requestedPermissions[key].map(user => {
      const duplicatedUser = permissions[key].find(existingUser => user === existingUser);
      if (!duplicatedUser) {
        permissions[key] = [...permissions[key], user];
      }
    });
  });

  return permissions;
};

export default GlobalModel;
