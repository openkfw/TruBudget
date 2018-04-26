import { ServerRequest } from "http";
import { MultichainClient, StreamKind } from "../multichain/Client.h";
import { authorized } from "../authz/index";
import { GlobalOnChain } from "../multichain";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import Intent from "../authz/intents";

const globalPermissionsTemplate = {
  "global.intent.listPermissions": ["root"],
  "global.intent.grantPermission": ["root"],
  "global.intent.revokePermission": ["root"],
  "global.createProject": ["root"],
  "global.createUser": ["root"],
  "user.view": ["root"]
};

export class GlobalModel {
  streamId: StreamKind = "global";
  multichain: MultichainClient;
  key = "permissions";

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  async listPermissions(authorized) {
    const globalPermissions = await GlobalOnChain.getPermissions(this.multichain);
    await authorized(globalPermissions);
    return globalPermissions;
  }

  listPermissionsForUser = async (authorized, userId) => {
    const globalPermissions = await this.listPermissions(authorized);
    const allowedIntents = Object.keys(globalPermissions).map(key => {
      const intent = globalPermissions[key].find(user => user === userId);
      if (intent) {
        return key;
      }
    });

    return allowedIntents.filter(intent => intent !== undefined);
  };

  async grantPermissions(authorized, intentToGrant: Intent, targetUser: string) {
    const permissionsByIntent = await GlobalOnChain.getPermissions(this.multichain);
    await authorized(permissionsByIntent);
    const permissions = permissionsByIntent[intentToGrant] || [];
    if (permissions.indexOf(targetUser) === -1) {
      // Update permissions:
      permissions.push(targetUser);
      permissionsByIntent[intentToGrant] = permissions;
      return GlobalOnChain.replacePermissions(this.multichain, permissionsByIntent);
    } else {
      // Permission already set.
    }
  }
}
