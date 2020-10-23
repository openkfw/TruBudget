import logger from "../lib/logger";
import {
  BlockInfo,
  BlockListItem,
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
import * as Liststreamkeyitems from "./liststreamkeyitems";
import { ConnectionSettings, RpcClient } from "./RpcClient.h";

// Oddly enough, there is no way to tell Multichain to return _everything_..
const maxItemCount: number = 0x7fffffff;

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

  public getRpcClient() {
    return this.rpcClient;
  }

  public async getOrCreateStream(options: CreateStreamOptions): Promise<StreamTxId> {
    const streamName = options.name || randomStreamName();

    const isPublic = true; // in multichain terms: isOpen
    const customFields = { kind: options.kind };
    const txId: StreamTxId = await this.rpcClient
      .invoke("create", "stream", streamName, isPublic, customFields)
      .then(() => logger.debug({ options }, `Created stream ${streamName} with options`))
      .catch((err) => {
        if (options.name && err && err.code === -705) {
          // Stream or asset with this name already exists
          logger.trace(
            { params: { err, options } },
            "Stream or asset with this name already exists",
          );
          return options.name;
        }
        logger.error({ error: err }, "Stream could not be created.");
        throw err;
      });

    return txId;
  }

  public async streams(name?: string): Promise<Stream[]> {
    const streamNames = name !== undefined ? name : "*";
    try {
      const streams = (await this.rpcClient.invoke("liststreams", streamNames)) as Stream[];
      return streams;
    } catch (err) {
      if (err && err.code === -708 && name !== undefined) {
        return [];
      }
      throw err;
    }
  }

  public async streamItems(streamId: StreamName | StreamTxId): Promise<StreamItem[]> {
    const items: MultichainStreamItem[] = await this.rpcClient.invoke(
      "liststreamitems",
      streamId,
      false,
      maxItemCount,
    );
    return items.map((item) => ({
      key: item.keys[0],
      value: hexToObject(item.data),
    }));
  }

  public async latestValuesForKey(
    streamId: StreamName | StreamTxId,
    key: string,
    nValues: number = 1,
  ): Promise<any[]> {
    const items: MultichainStreamItem[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamId, key, false, nValues)
      .then(this.retrieveItems);
    return items.map((x) => hexToObject(x.data));
  }

  public async updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string,
    object: any,
  ): Promise<TxId> {
    const data = objectToHex(object);
    return await this.rpcClient.invoke("publish", streamId, key, data);
  }

  public async isValidAddress(address: string): Promise<boolean> {
    const result = await this.rpcClient.invoke("validateaddress", address);
    return result.isvalid;
  }

  public async getInfo(): Promise<any> {
    return await this.rpcClient.invoke("getinfo");
  }

  public async getValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<StreamItemPair[]> {
    const items: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .then(this.retrieveItems)
      .catch((err) => {
        if (err && err.code === -708) {
          throw { kind: "NotFound", what: `stream ${streamName}` };
        } else {
          throw err;
        }
      });
    return items.map((x) => ({
      key: x.keys,
      resource: hexToObject(x.data) as Resource,
    }));
  }

  public async getLatestValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<StreamItemPair[]> {
    const allItemsAllValues: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .then(this.retrieveItems)
      .catch((err) => {
        if (err && err.code === -708) {
          throw { kind: "NotFound", what: `stream ${streamName}` };
        } else {
          throw err;
        }
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

  public async getValue(streamName: StreamName, key: string): Promise<StreamItemPair> {
    const result = await this.getValues(streamName, key, 1);
    if (result.length !== 1) {
      const message = `Expected a single value, got: ${result || "nothing"}`;
      throw {
        kind: "NotFound",
        what: { message, streamName, key },
      };
    }
    return result[0];
  }

  public async setValue(streamName: StreamName, streamkey: StreamKey, object: any): Promise<void> {
    const data = objectToHex(object);
    return this.rpcClient.invoke("publish", streamName, streamkey, data);
  }

  public async updateValue(
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

  public async getLastBlockInfo(skip: number = 0): Promise<BlockInfo> {
    return this.rpcClient.invoke("getlastblockinfo", skip);
  }

  public async ping(): Promise<any> {
    return this.rpcClient.invoke("ping");
  }

  public async listBlocksByHeight(
    to: number,
    from: number | string = 0,
    verbose: boolean = false,
  ): Promise<BlockListItem[]> {
    return this.rpcClient.invoke("listblocks", `${from}-${to}`, verbose);
  }

  public async listStreamBlockItemsByHeight(
    streamName: StreamName,
    to: number,
    from: number = 0,
    verbose: boolean = false,
  ): Promise<Liststreamkeyitems.Item[]> {
    return this.rpcClient
      .invoke("liststreamblockitems", streamName, `${from}-${to}`, verbose)
      .then(this.retrieveItems)
      .catch((err) => {
        if (err && err.code === -708) {
          throw { kind: "NotFound", what: `stream ${streamName}` };
        } else {
          throw err;
        }
      });
  }

  public async v2_readStreamItems(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<Liststreamkeyitems.Item[]> {
    if (nValues <= 0) {
      const message = `expected nValues > 0, got ${nValues}`;
      throw Error(message);
    }
    return this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .then((items: Liststreamkeyitems.Item[]) => this.retrieveItems(items))
      .catch((err) => {
        if (err && err.code === -708) {
          throw { kind: "NotFound", what: `stream ${streamName}` };
        } else {
          throw err;
        }
      });
  }

  private async retrieveItems(
    items: Liststreamkeyitems.Item[],
  ): Promise<Liststreamkeyitems.Item[]> {
    // if data size is bigger than the runtime variable "maxshowndata"
    // the data has to be accessed by calling gettxoutdata
    // Increase maxshowndata with command 'setruntimeparam maxshowndata <value>' in the multichain-cli
    return Promise.all(
      items.map(async (item: Liststreamkeyitems.Item) => {
        if (item.data && item.data.hasOwnProperty("vout") && item.data.hasOwnProperty("txid")) {
          logger.warn(
            "Reached max data size. Maybe you should increase the runtime variable 'maxshowndata' of the multichain" +
              "with command: 'setruntimeparam maxshowndata <value>'.",
          );
          item.data = await this.rpcClient.invoke("gettxoutdata", item.data.txid, item.data.vout);
          logger.debug({ item: item.data }, `Received items.`);
        }
        return item;
      }),
    );
  }
}

const sleep = (timeout: number) => new Promise((resolve) => setTimeout(resolve, timeout));
