const { RpcClient } = require("multichain-api/RpcClient");
const { ListStreams } = require("multichain-api/Commands/ListStreams");
const { ListStreamItems } = require("multichain-api/Commands/ListStreamItems");
const { ListStreamKeyItems } = require("multichain-api/Commands/ListStreamKeyItems");

interface RpcClientOptions {
  protocol: "http" | "https";
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface ProjectMetadata {
  creationUnixTs: string;
  status: "open" | "in progress" | "done";
  name: string;
  description?: string;
  amount: string;
  currency: string;
  thumbnail?: string;
}

// (Writable) metadata:
type StreamMetadata = ProjectMetadata;
const metadataKey = "_metadata";

// The "stream details" are read-only, so they're only used to define the stream's nature:
interface StreamDetails {
  kind?: "project" | "subproject";
}

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

interface RpcResult {
  result?: Stream[];
  error?: any;
  id?: any;
}

const rpc = (cmd: any): any =>
  new Promise(async (resolve, reject) => {
    const res = (await this.rpcClient(cmd)) as RpcResult;
    if (res.error) {
      reject(res.error);
    } else {
      resolve(res.result as Stream[]);
    }
  });

class MultichainClient {
  rpcClient: (/* command */ any) => Promise<any>;
  constructor(options: RpcClientOptions) {
    this.rpcClient = RpcClient(options);
  }
  async streams(): Promise<Stream[] | any> {
    return rpc(ListStreams()) as Promise<Stream[] | any>;
  }
  async metadata(stream: Stream): Promise<StreamMetadata | any> {
    const cmd = ListStreamKeyItems(stream.name || stream.createtxid, metadataKey, "count=1");
    return rpc(cmd) as Promise<StreamMetadata | any>;
  }
}

export default MultichainClient;
