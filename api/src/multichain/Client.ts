import {
  MultichainClient,
  CreateStreamOptions,
  StreamTxId,
  Stream,
  StreamName,
  StreamItem,
  TxId,
  StreamItemPair,
  Resource
} from "./Client.h";
import * as Liststreamkeyitems from "./responses/liststreamkeyitems";
import * as Liststreamitems from "./responses/liststreamitems";
import { RpcClient, ConnectionSettings } from "./RpcClient.h";
import { randomString } from "./hash";
import { objectToHex, hexToObject } from "./hexconverter";
import { StreamKey } from "./Client.h";

// Oddly enough, there is no way to tell Multichain to return _everything_..
const maxItemCount: number = 0x7fffffff;

const streamItemKeys: any = {
  metadata: "_metadata",
  log: "_log",
  permissions: "permissions"
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
        console.log(`RPC: ${JSON.stringify(err)}`);
        if (options.name && err.code === -705) {
          // Stream or asset with this name already exists
          console.log(`Skipping stream creation: stream "${options.name}" already exists.`);
          return options.name;
        }
        throw err;
      });

    return txId;
  }

  async streams(): Promise<Stream[]> {
    return (await this.rpcClient.invoke("liststreams")) as Stream[];
  }

  async streamItems(streamId: StreamName | StreamTxId): Promise<StreamItem[]> {
    const items: MultichainStreamItem[] = await this.rpcClient.invoke(
      "liststreamitems",
      streamId,
      false,
      maxItemCount
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

  async getInfo(): Promise<any> {
    return await this.rpcClient.invoke("getinfo");
  }

  async getValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount
  ): Promise<StreamItemPair[]> {
    const items: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch(err => {
        if (err.code === -708) throw { kind: "NotFound", what: `stream ${streamName}` };
        else throw err;
      });
    return items.map(x => ({
      key: x.keys,
      resource: hexToObject(x.data) as Resource
    }));
  }

  async getLatestValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount
  ): Promise<StreamItemPair[]> {
    const allItemsAllValues: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch(err => {
        if (err.code === -708) throw { kind: "NotFound", what: `stream ${streamName}` };
        else throw err;
      });
    const allItemsLatestValues = Array.from(
      allItemsAllValues
        .reverse()
        .reduce((result: Map<String, Liststreamkeyitems.Item>, item: Liststreamkeyitems.Item) => {
          const mapKey = item.keys.join("_");
          if (!result.has(mapKey)) {
            result.set(mapKey, item);
          }
          return result;
        }, new Map())
        .values()
    )
      .reverse()
      .map(x => ({
        key: x.keys,
        resource: hexToObject(x.data) as Resource
      }));
    return allItemsLatestValues;
  }

  async getValue(streamName: StreamName, key: string): Promise<StreamItemPair> {
    const result = await this.getValues(streamName, key, 1);
    if (result.length !== 1) {
      throw {
        kind: "NotFound",
        what: { message: `Expected a single value, got: ${result}`, streamName, key }
      };
    }
    return result[0];
  }

  async setValue(streamName: StreamName, streamkey: StreamKey, object: any): Promise<void> {
    const data = objectToHex(object);
    return this.rpcClient.invoke("publish", streamName, streamkey, data);
  }
}
