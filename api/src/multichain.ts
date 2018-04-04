const { RpcClient } = require("multichain-api/RpcClient");
const { ListStreams } = require("multichain-api/Commands/ListStreams");
const { ListStreamItems } = require("multichain-api/Commands/ListStreamItems");

interface RpcClientOptions {
  protocol: "http" | "https";
  host: string;
  port: number;
  username: string;
  password: string;
}

interface StreamDetails {}

export interface Stream {
  name: string;
  createtxid: string;
  streamref: string;
  open: boolean;
  details: StreamDetails;
  subscribed: boolean;
  synchronized: boolean;
  items: number;
  confirmed: number;
  keys: number;
  publishers: number;
}

interface ListStreamsResult {
  result?: Stream[];
  error?: any;
  id?: any;
}

class MultichainClient {
  rpcClient: (/* command */ any) => Promise<any>;
  constructor(options: RpcClientOptions) {
    this.rpcClient = RpcClient(options);
  }
  async streams(): Promise<Stream[] | any> {
    return new Promise(async (resolve, reject) => {
      const res = (await this.rpcClient(ListStreams())) as ListStreamsResult;
      if (res.error) {
        reject(res.error);
      } else {
        resolve(res.result as Stream[]);
      }
    });
  }
}

export default MultichainClient;
