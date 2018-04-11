import {
  MultichainClient,
  CreateStreamOptions,
  StreamTxId,
  Stream,
  StreamBody,
  StreamName,
  StreamItem
} from "./Client.h";
import { RpcClient, ConnectionSettings } from "./RpcClient.h";
import { randomString } from "./hash";
import { objectToHex, hexToObject } from "./hexconverter";


const COUNT = 10e6;
const streamItemKeys: any = {
  metadata: "_metadata",
  log: "_log",
  permissions: "_permissions"
};

const randomStreamName = (): string => randomString(16);

const foo = async client => {
  const res = await client
    .invoke("liststreamkeyitems", "users", "alice", false, 1)
    .catch(err => console.log(`CATCHED: ${err}`));
  console.log(`YES: ${JSON.stringify(res)}`);
};

// Stream Item as returned by the API
interface MultichainStreamItem {
  publishers: string[];
  keys: string[];
  data: string;
  confirmations: number;
  blocktime: number;
  txid: string;
}

export class RpcMultichainClient implements MultichainClient {
  private rpcClient: RpcClient;
  constructor(settings: ConnectionSettings) {
    this.rpcClient = new RpcClient(settings);
    foo(this.rpcClient);
  }

  async createStream(options: CreateStreamOptions): Promise<StreamTxId> {
    // If the stream name is set, we need to check first whether the stream exists already:
    if (options.name) {
      const [verbose, count] = [false, 1];
      const existingStream: Stream | null = await this.rpcClient
        .invoke("liststreams", options.name, verbose, count)
        .catch(_err => null);
      if (existingStream !== null) {
        console.log(`Found stream: ${JSON.stringify(existingStream)}`);
        console.log(`Skipping stream creation: stream "${options.name}" already exists.`);
        return options.name;
      }
    }

    const streamName = options.name || randomStreamName();
    const isPublic = true;
    console.log(`:createStream options=${JSON.stringify(options)} => name=${streamName}`);
    const txId: StreamTxId = await this.rpcClient.invoke("create", "stream", streamName, isPublic, {
      kind: options.kind
    });
    if (options.initialLogEntry) {
      await this.updateStreamItem(txId, "_log", options.initialLogEntry);
    }
    if (options.metadata) {
      await this.updateStreamItem(txId, "_metadata", options.metadata);
    }
    if (options.permissions) {
      await this.updateStreamItem(txId, "_permissions", options.permissions);
    }

    await Promise.all(
      (options.extraLogEntries || []).map(entry =>
        this.updateStreamItem(entry.streamName, "_log", entry.entry)
      )
    );
    return txId;
  }

  async streams(): Promise<Stream[]> {
    return (await this.rpcClient.invoke("liststreams")) as Stream[];
  }

  async streamBody(stream: Stream): Promise<StreamBody> {
    const nAllItems = 1000;
    const streamId = stream.name || stream.createtxid;
    const body = await Promise.all([
      this.rpcClient.invoke("liststreamkeyitems", streamId, "_metadata", false, 1),
      this.rpcClient.invoke("liststreamkeyitems", streamId, "_log", false, nAllItems),
      this.rpcClient.invoke("liststreamkeyitems", streamId, "_permissions", false, 1)
    ]);

    // TODO more than one log entry
    return {
      metadata: hexToObject(body[0][0].data),
      log: hexToObject(body[1][0].data),
      permissions: hexToObject(body[2][0].data)
    };
  }

  async streamItem(streamId: StreamName | StreamTxId, key: string): Promise<StreamItem> {
    const items = await this.rpcClient.invoke("liststreamkeyitems", streamId, key, false, 1);
    if (items.length === 0) {
      throw Error(`Item "${key}" not found in stream "${streamId}"`);
    }

    const item = items[0] as MultichainStreamItem;
    if (key !== item.keys[0]) throw Error(`Assertion failed: ${key} !== ${item.keys[0]}`);
    return {
      key: key,
      value: hexToObject(item.data),
      txid: item.txid
    };
  }

  updateStreamItem(streamId: StreamName | StreamTxId, key: string, object: any): Promise<any> {
    console.log('------------------------')
    const data = objectToHex(object);
    console.log(data)
    return this.rpcClient.invoke("publish", streamId, key, data);
  }
}
