import { MultichainClient } from "../multichain/Client.h";
import { authorized } from "../authz/index";

const globalPermissionsTemplate = {
  "global.intent.list": [],
  "global.intent.grantPermission": [],
  "global.intent.revokePermission": [],
  "global.createProject": [],
  "global.createUser": []
};

export class GlobalModel {
  multichain: MultichainClient;
  key = "_permissions";

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }
  /* TODO root permissions */
  rootPermissions = new Map<string, string[]>();

  async listPermissions(authorized) {
    const streamId = "global";
    await authorized(this.rootPermissions);
    return await this.multichain.latestValuesForKey("global", this.key);
  }

  async grantPermissions(requestedPermissions, authorized) {
    let mergedPermissions = {};
    // TS won't allow to use streamId as global variable :()
    const streamId = "global";
    await authorized(this.rootPermissions);
    await this.multichain.getOrCreateStream({
      kind: streamId,
      name: streamId
    });
    const existingPermissions = await this.multichain.latestValuesForKey(streamId, this.key);
    if (existingPermissions.length === 0) {
      mergedPermissions = this.mergePermissions(requestedPermissions, globalPermissionsTemplate);
    } else {
      mergedPermissions = this.mergePermissions(requestedPermissions, existingPermissions[0]);
    }
    await this.multichain.updateStreamItem(streamId, this.key, mergedPermissions);
  }

  mergePermissions = (requestedPermissions, existingPermissions) => {
    const keys = Object.keys(existingPermissions);
    keys.map(key => {
      return (existingPermissions[key] = existingPermissions[key].concat(
        requestedPermissions[key] === undefined ? [] : requestedPermissions[key]
      ));
    });
    return existingPermissions;
  };
}
