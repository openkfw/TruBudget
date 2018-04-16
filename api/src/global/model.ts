import { ServerRequest } from "http";
import { MultichainClient, StreamKind } from "../multichain/Client.h";
import { authorized } from "../authz/index";
import { mergePermissions } from "./index";

const globalPermissionsTemplate = {
  "global.intent.list": ["root"],
  "global.intent.grantPermission": ["root"],
  "global.intent.revokePermission": ["root"],
  "global.createProject": ["root"],
  "global.createUser": ["root"],
  "user.view": ["root"]
};

export class GlobalModel {
  streamId: StreamKind = "global";
  multichain: MultichainClient;
  key = "_permissions";

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
    this.createGlobalStream();
  }
  /* TODO root permissions */
  rootPermissions = new Map<string, string[]>();

  async createGlobalStream() {
    await this.multichain.getOrCreateStream({
      kind: this.streamId,
      name: this.streamId
    });
    const existingPermissions = await this.multichain.latestValuesForKey(this.streamId, this.key);
    if (existingPermissions.length === 0) {
      await this.multichain.updateStreamItem(this.streamId, this.key, globalPermissionsTemplate);
    }
  }

  async listPermissions(authorized) {
    const globalPermissions = await this.multichain.latestValuesForKey(this.streamId, this.key);
    await authorized(globalPermissions);
    return globalPermissions;
  }

  async grantPermissions(requestedPermissions, authorized) {
    let mergedPermissions = {};
    await this.multichain.getOrCreateStream({
      kind: this.streamId,
      name: this.streamId
    });
    const existingPermissions = await this.multichain.latestValuesForKey(this.streamId, this.key);
    await authorized(existingPermissions);
    mergedPermissions = mergePermissions(requestedPermissions, existingPermissions[0]);
    await this.multichain.updateStreamItem(this.streamId, this.key, mergedPermissions);
  }
}
