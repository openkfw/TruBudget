import { MultichainClient, StreamKind } from "../multichain/Client.h";
import { authorized } from "../authz/index";

const globalPermissionsTemplate = {
  "global.intent.list": [],
  "global.intent.grantPermission": [],
  "global.intent.revokePermission": [],
  "global.createProject": [],
  "global.createUser": []
};

export class GlobalModel {
  streamId: StreamKind = "global";
  multichain: MultichainClient;
  key = "_permissions";

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }
  /* TODO root permissions */
  rootPermissions = new Map<string, string[]>();

  async listPermissions(authorized) {
    await authorized(this.rootPermissions);
    return await this.multichain.latestValuesForKey(this.streamId, this.key);
  }

  async grantPermissions(requestedPermissions, authorized) {
    let mergedPermissions = {};

    await authorized(this.rootPermissions);
    await this.multichain.getOrCreateStream({
      kind: this.streamId,
      name: this.streamId
    });
    const existingPermissions = await this.multichain.latestValuesForKey(this.streamId, this.key);
    if (existingPermissions.length === 0) {
      mergedPermissions = mergePermissions(requestedPermissions, globalPermissionsTemplate);
    } else {
      mergedPermissions = mergePermissions(requestedPermissions, existingPermissions[0]);
    }
    await this.multichain.updateStreamItem(this.streamId, this.key, mergedPermissions);
  }
}

export const mergePermissions = (requestedPermissions, existingPermissions) => {
  const keys = Object.keys(existingPermissions);
  keys.map(key => {
    return (existingPermissions[key] = existingPermissions[key].concat(
      requestedPermissions[key] === undefined ? [] : requestedPermissions[key]
    ));
  });
  return existingPermissions;
};
