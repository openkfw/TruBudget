import { GlobalModel } from "./model";

export const mergePermissions = (requestedPermissions, existingPermissions) => {
  console.log(requestedPermissions);
  console.log(existingPermissions);
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
