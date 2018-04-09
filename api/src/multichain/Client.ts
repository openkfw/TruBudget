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
import { objectToHex } from "./hexconverter";

const streamItemKeys: any = {
  metadata: "_metadata",
  log: "_log",
  permissions: "_permissions"
};

const randomStreamName = (): string => randomString(16);

const foo = async client => {
  const res = await client
    .invoke("liststreamkeys", "users", "alice")
    .catch(err => console.log(`CATCHED: ${err}`));
  console.log(`YES: ${JSON.stringify(res)}`);
};

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

  streamItem(streamId: StreamName | StreamTxId, key: string): Promise<StreamItem> {
    // in case there is no item with the given key, there will still be a result with
    // "items" and "confirmed" set to "0".
    return this.rpcClient.invoke("liststreamkeys", streamId, key).then(items => items[0]);
  }

  updateStreamItem(streamId: StreamName | StreamTxId, key: string, object: any): Promise<any> {
    const data = objectToHex(object);
    return this.rpcClient.invoke("publish", streamId, key, data);
  }
}
