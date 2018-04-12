import { MultichainClient } from "../multichain/Client.h";

export class GlobalModel {
  multichain: MultichainClient;

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  async initGlobalPermissions() {
    const globalItems = await this.multichain.streamItems("global");
    const globalPermissions = globalItems.map(item => item.key === "_permissions");
  }
}
