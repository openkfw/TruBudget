import {
  MultichainClient,
  CreateStreamOptions,
  StreamTxId,
  Stream,
  StreamBody,
  StreamName,
  StreamItem,
  TxId
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
  }

  async getOrCreateStream(options: CreateStreamOptions): Promise<StreamTxId> {
    const streamName = options.name || randomStreamName();

    console.log(`:createStream options=${JSON.stringify(options)} => name=${streamName}`);

    const isPublic = true; // in multichain terms: isOpen
    const customFields = { kind: options.kind };
    const txId: StreamTxId = await this.rpcClient
      .invoke("create", "stream", streamName, isPublic, customFields)
      .catch(err => {
        console.log(`RPC ERROR: ${JSON.stringify(err)}`);
        if (options.name && err.code === -705) {
          // Stream or asset with this name already exists
          console.log(`Skipping stream creation: stream "${options.name}" already exists.`);
          return options.name;
        }
        throw err;
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

  async streamItems(streamId: StreamName | StreamTxId, nValues: number = 1): Promise<StreamItem[]> {
    const items: MultichainStreamItem[] = await this.rpcClient.invoke(
      "liststreamitems",
      streamId,
      false,
      nValues
    );
    return items.map(item => ({
      key: item.keys[0],
      value: hexToObject(item.data)
    }));
  }

  async latestValuesForKey(
    streamId: StreamName | StreamTxId,
    key: string,
    nValues: number = 1
  ): Promise<any[]> {
    const items: MultichainStreamItem[] = await this.rpcClient.invoke(
      "liststreamkeyitems",
      streamId,
      key,
      false,
      nValues
    );
    return items.map(x => hexToObject(x.data));
  }

  async updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string,
    object: any
  ): Promise<TxId> {
    const data = objectToHex(object);
    return await this.rpcClient.invoke("publish", streamId, key, data);
  }
}
