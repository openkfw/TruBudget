import logger from "../lib/logger";
import {
  CreateStreamOptions,
  MultichainClient,
  Resource,
  Stream,
  StreamItem,
  StreamItemPair,
  StreamKey,
  StreamName,
  StreamTxId,
  TxId,
} from "./Client.h";
import { randomString } from "./hash";
import { hexToObject, objectToHex } from "./hexconverter";
import * as Liststreamkeyitems from "./responses/liststreamkeyitems";
import { ConnectionSettings, RpcClient } from "./RpcClient.h";

// Oddly enough, there is no way to tell Multichain to return _everything_..
const maxItemCount: number = 0x7fffffff;

const streamItemKeys: any = {
  metadata: "_metadata",
  log: "_log",
  permissions: "permissions",
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

export const asMapKey = (item: Liststreamkeyitems.Item): string => item.keys.join();

export class RpcMultichainClient implements MultichainClient {
  private rpcClient: RpcClient;
  private hasWriteLock: boolean;
  constructor(settings: ConnectionSettings) {
    this.rpcClient = new RpcClient(settings);
    this.hasWriteLock = false;
  }

  getRpcClient() {
    return this.rpcClient;
  }

  async getOrCreateStream(options: CreateStreamOptions): Promise<StreamTxId> {
    const streamName = options.name || randomStreamName();

    const isPublic = true; // in multichain terms: isOpen
    const customFields = { kind: options.kind };
    const txId: StreamTxId = await this.rpcClient
      .invoke("create", "stream", streamName, isPublic, customFields)
      .then(() =>
        logger.debug(`Created stream ${streamName} with options ${JSON.stringify(options)}`),
      )
      .catch(err => {
        if (options.name && err && err.code === -705) {
          // Stream or asset with this name already exists
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
      maxItemCount,
    );
    return items.map(item => ({
      key: item.keys[0],
      value: hexToObject(item.data),
    }));
  }

  async latestValuesForKey(
    streamId: StreamName | StreamTxId,
    key: string,
    nValues: number = 1,
  ): Promise<any[]> {
    const items: MultichainStreamItem[] = await this.rpcClient.invoke(
      "liststreamkeyitems",
      streamId,
      key,
      false,
      nValues,
    );
    return items.map(x => hexToObject(x.data));
  }

  async updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string,
    object: any,
  ): Promise<TxId> {
    const data = objectToHex(object);
    return await this.rpcClient.invoke("publish", streamId, key, data);
  }

  async isValidAddress(address: string) : Promise<any>{
    const result =  await this.rpcClient.invoke("validateaddress", address);
    return result.isvalid;
  }

  async getInfo(): Promise<any> {
    return await this.rpcClient.invoke("getinfo");
  }

  async getValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<StreamItemPair[]> {
    const items: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch(err => {
        if (err && err.code === -708) throw { kind: "NotFound", what: `stream ${streamName}` };
        else throw err;
      });
    return items.map(x => ({
      key: x.keys,
      resource: hexToObject(x.data) as Resource,
    }));
  }

  async getLatestValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<StreamItemPair[]> {
    const allItemsAllValues: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch(err => {
        if (err && err.code === -708) throw { kind: "NotFound", what: `stream ${streamName}` };
        else throw err;
      });
    const allItemsLatestValues = Array.from(
      allItemsAllValues
        .reverse()
        .reduce((result: Map<string, Liststreamkeyitems.Item>, item: Liststreamkeyitems.Item) => {
          const mapKey = item.keys.join("_");
          if (!result.has(mapKey)) {
            result.set(mapKey, item);
          }
          return result;
        }, new Map())
        .values(),
    )
      .map((x: Liststreamkeyitems.Item) => ({
        key: x.keys,
        resource: hexToObject(x.data) as Resource,
      }))
      // TODO: Until we need to be able to re-order things, it's good enough to sort by ctime:
      .sort((a: StreamItemPair, b: StreamItemPair) => {
        const ctimeA = a.resource.data.creationUnixTs;
        const ctimeB = b.resource.data.creationUnixTs;
        // If the resources don't have a ctime set, fall back to reversing back into the original ordering:
        if (ctimeA === undefined || ctimeB === undefined) {
          return 1; // = b before a
        } else if (ctimeA < ctimeB) {
          return -1; // = a is older, so a before b
        } else if (ctimeA > ctimeB) {
          return 1; // = a is more recent, so b before a
        } else {
          return 0; // any order, since we do unstable storting
        }
      });
    return allItemsLatestValues;
  }

  async getValue(streamName: StreamName, key: string): Promise<StreamItemPair> {
    const result = await this.getValues(streamName, key, 1);
    if (result.length !== 1) {
      throw {
        kind: "NotFound",
        what: { message: `Expected a single value, got: ${result}`, streamName, key },
      };
    }
    return result[0];
  }

  async setValue(streamName: StreamName, streamkey: StreamKey, object: any): Promise<void> {
    const data = objectToHex(object);
    return this.rpcClient.invoke("publish", streamName, streamkey, data);
  }

  async updateValue(
    streamName: StreamName,
    key: string,
    updateCallback: (_: Resource) => Resource,
  ): Promise<void> {
    while (this.hasWriteLock) {
      await sleep(1);
    }
    this.hasWriteLock = true;
    try {
      const streamItem = await this.getValue(streamName, key);
      streamItem.resource = updateCallback(streamItem.resource);
      await this.setValue(streamName, streamItem.key, streamItem.resource);
    } finally {
      this.hasWriteLock = false;
    }
  }

  public async v2_readStreamItems(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<Liststreamkeyitems.Item[]> {
    if (nValues <= 0) throw Error(`expected nValues > 0, got ${nValues}`);
    return this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch(err => {
        if (err && err.code === -708) throw { kind: "NotFound", what: `stream ${streamName}` };
        else throw err;
      });
  }
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));
