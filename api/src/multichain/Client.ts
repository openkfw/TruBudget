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
    const body = await this.rpcClient.invoke("liststreamitems", stream.name || stream.createtxid);
    console.log(body);
    return {
      metadata: body["_metadata"],
      log: body["_log"],
      permissions: body["_permissions"]
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
    const data = objectToHex(object);
    return this.rpcClient.invoke("publish", streamId, key, data);
  }
}
