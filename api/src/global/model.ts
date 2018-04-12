import { MultichainClient } from "../multichain/Client.h";

export class GlobalModel {
  multichain: MultichainClient;

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  async initGlobalPermissions() {
    const globalItems = await this.multichain.listStreamItems("global");
    const globalPermissions = globalItems.items.map(item => item.key === "permissions");
  }
}
