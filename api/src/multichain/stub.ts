import {
  Stream,
  MultichainClient,
  CreateStreamOptions,
  StreamName,
  StreamTxId,
  StreamItem,
  StreamItemPair
} from "./Client.h";

const metadata = {
  "Project One": {
    creationUnixTs: "0",
    status: "open",
    name: "Project One",
    description: "First example project.",
    amount: "1234.56",
    currency: "EUR",
    thumbnail: "default.jpg"
  }
};

class MultichainClientStub implements MultichainClient {
  getLatestValues(
    streamName: string,
    key: string,
    nValues?: number | undefined
  ): Promise<StreamItemPair[]> {
    throw new Error("Method not implemented.");
  }
  getValue(streamName: string, key: string): Promise<any> {
    throw new Error("Method not implemented.");
  }
  getValues(streamName: string, key: string, nValues?: number | undefined): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  setValue(streamName: string, keys: string | string[], object: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  streamItems(streamId: string): Promise<StreamItem[]> {
    throw new Error("Method not implemented.");
  }
  latestValuesForKey(streamId: string, key: string, nValues?: number | undefined): Promise<any[]> {
    throw new Error("Method not implemented.");
  }
  updateStreamItem(streamId: string, key: string, object: any): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getOrCreateStream(options: CreateStreamOptions) {
    throw new Error("Method not implemented.");
  }
  async getInfo(): Promise<any> {
    // copy pasted from real info...
    // currently used fields: nodeaddress
    return {
      version: "2.0 alpha 2",
      nodeversion: 20000102,
      protocolversion: 20002,
      chainname: "ACMECorpChain",
      description: "MultiChain ACMECorpChain",
      protocol: "multichain",
      port: 7425,
      setupblocks: 60,
      nodeaddress: "ACMECorpChain@172.18.0.2:7425",
      burnaddress: "1XXXXXXX4XXXXXXXrcXXXXXXdLXXXXXXVCW9Q5",
      incomingpaused: false,
      miningpaused: false,
      walletversion: 60000,
      balance: 0,
      walletdbversion: 2,
      reindex: false,
      blocks: 59,
      timeoffset: 0,
      connections: 0,
      proxy: "",
      difficulty: 5.960464478e-8,
      testnet: false,
      keypoololdest: 1524488901,
      keypoolsize: 2,
      paytxfee: 0,
      relayfee: 0,
      errors: ""
    };
  }
  async streams(): Promise<Stream[]> {
    return [
      {
        name: "root",
        createtxid: "b0b4193694923b030eadac026a60a547215168e6f5b7dd57246f3ae0290db693",
        streamref: "0-0-0",
        open: true,
        details: {},
        subscribed: true,
        synchronized: true,
        items: 0,
        confirmed: 0,
        keys: 0,
        publishers: 0
      },
      {
        name: "Project One",
        createtxid: "b0923874982747982783479283479247215168e6f5b7dd57246f3ae0290db693",
        streamref: "0-0-0",
        open: true,
        details: { kind: "project" },
        subscribed: true,
        synchronized: true,
        items: 0,
        confirmed: 0,
        keys: 0,
        publishers: 0
      }
    ];
  }
}

export default MultichainClientStub;
