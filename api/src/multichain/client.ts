const { ListStreams } = require("multichain-api/Commands/ListStreams");
const { ListStreamItems } = require("multichain-api/Commands/ListStreamItems");
const { ListStreamKeyItems } = require("multichain-api/Commands/ListStreamKeyItems");
import * as RPC from "./rpc";

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
export type StreamMetadata = ProjectMetadata;
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

export interface MultichainClient {
  streams(): Promise<Stream[]>;
  metadata(stream: Stream): Promise<StreamMetadata>;
}

export class RpcMultichainClient implements MultichainClient {
  private invoke: RPC.ClientType;
  constructor(options: RPC.ClientOptions) {
    this.invoke = RPC.Client(options);
  }
  private async invokeUnwrap(cmd) {
    const result: RPC.Result = await this.invoke(cmd);
    if (result.error) throw result.error;
    return result.result;
  }
  async streams(): Promise<Stream[]> {
    const cmd = ListStreams();
    return (await this.invokeUnwrap(cmd)) as Stream[];
  }
  async metadata(stream: Stream): Promise<StreamMetadata> {
    const cmd = ListStreamKeyItems(stream.name || stream.createtxid, metadataKey, "count=1");
    return (await this.invokeUnwrap(cmd)) as StreamMetadata;
  }
}
