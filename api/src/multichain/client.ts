const { Create } = require("multichain-api/Commands/Create");
const { Publish } = require("multichain-api/Commands/Publish");
const { ListStreams } = require("multichain-api/Commands/ListStreams");
const { ListStreamItems } = require("multichain-api/Commands/ListStreamItems");
const { ListStreamKeyItems } = require("multichain-api/Commands/ListStreamKeyItems");
import * as RPC from "./rpc";
import { objectToHex } from "./hexconverter";
import { randomString } from "./hash";

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

type StreamKind = "project" | "subproject";

// The "stream details" are read-only, so they're only used to define the stream's nature:
interface StreamDetails {
  kind?: StreamKind;
}

export type StreamTxId = string;

export interface Stream {
  name: string;
  createtxid: StreamTxId;
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

export interface LogEntry {
  issuer: string;
  description?: string;
  action: string;
}

export interface CreateStreamOptions {
  kind: StreamKind;
  name?: string; // random if not given
  metadata?: StreamMetadata;
  initialLogEntry?: LogEntry;
  extraLogEntries?: { streamName: string; entry: LogEntry }[];
}

export interface MultichainClient {
  createStream(options: CreateStreamOptions);
  streams(): Promise<Stream[]>;
  metadata(stream: Stream): Promise<StreamMetadata>;
}

const randomStreamName = (): string => randomString(16);

export class RpcMultichainClient implements MultichainClient {
  private invoke: RPC.ClientType;
  constructor(options: RPC.ClientOptions) {
    this.invoke = RPC.Client(options);
  }
  async createStream(options: CreateStreamOptions): Promise<StreamTxId> {
    const name = options.name || randomStreamName();
    const isPublic = true;
    const txId: StreamTxId = await this.invoke(
      Create("type=stream", name, isPublic, `{"kind":"${options.kind}"}`)
    );
    if (options.initialLogEntry) {
      const key = "_log";
      const data = objectToHex(options.initialLogEntry);
      await this.invoke(Publish(txId, key, data));
    }
    await Promise.all(
      (options.extraLogEntries || []).map(entry => {
        const key = "_log";
        const data = objectToHex(entry.entry);
        return this.invoke(Publish(entry.streamName, key, data));
      })
    );
    return txId;
  }
  async streams(): Promise<Stream[]> {
    const cmd = ListStreams();
    return (await this.invoke(cmd)) as Stream[];
  }
  async metadata(stream: Stream): Promise<StreamMetadata> {
    const cmd = ListStreamKeyItems(stream.name || stream.createtxid, metadataKey, "count=1");
    return (await this.invoke(cmd)) as StreamMetadata;
  }
}
