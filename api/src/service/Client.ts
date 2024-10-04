/* eslint-disable @typescript-eslint/no-explicit-any */
import { TruBudgetError } from "../error";
import logger from "../lib/logger";

import {
  BlockInfo,
  BlockListItem,
  CreateStreamOptions,
  MultichainClient,
  PeerInfo,
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
const maxItemCount = 0x7fffffff;

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

  public getRpcClient(): RpcClient {
    return this.rpcClient;
  }

  public async getOrCreateStream(options: CreateStreamOptions): Promise<StreamTxId> {
    const streamName = options.name || randomStreamName();

    const isPublic = true; // in multichain terms: isOpen
    const customFields = { kind: options.kind };

    // using streams with name parameter will lead to rpc invoke function printing out -708 error,
    // which is not desired for this method.
    const streams = await this.streams();
    const desiredStream = streams.filter((stream) => stream.name === streamName);
    // Prevent error -705 in invoke function / Stream or asset with this name already exists
    if (desiredStream.length > 0) {
      logger.trace({ params: { options } }, "Stream or asset with this name already exists");
      return streamName;
    }

    const txId: StreamTxId = await this.rpcClient
      .invoke("create", "stream", streamName, isPublic, customFields)
      .then(() => logger.debug({ options }, `Created stream ${streamName} with options`))
      .catch((err) => {
        logger.error({ err }, "Stream could not be created.");
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
    nValues = 1,
  ): Promise<any[]> {
    const items: MultichainStreamItem[] = await this.rpcClient.invoke(
      "liststreamkeyitems",
      streamId,
      key,
      false,
      nValues,
    );
    return items.map((x) => hexToObject(x.data));
  }

  public async updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string,
    object: any,
  ): Promise<TxId> {
    const data = objectToHex(object);
    return this.rpcClient.invokePublish(streamId, key, data);
  }

  public async isValidAddress(address: string): Promise<boolean> {
    const result = await this.rpcClient.invoke("validateaddress", address);
    return result.isvalid;
  }

  public async getInfo(): Promise<any> {
    return this.rpcClient.invoke("getinfo");
  }

  public async getValues(
    streamName: StreamName,
    key: string,
    nValues: number = maxItemCount,
  ): Promise<StreamItemPair[]> {
    const items: Liststreamkeyitems.Item[] = await this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch((err) => {
        if (err && err.code === -708) {
          throw new TruBudgetError({ kind: "NotFound", what: { stream: `stream ${streamName}` } });
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
      .catch((err) => {
        if (err && err.code === -708) {
          throw new TruBudgetError({ kind: "NotFound", what: { stream: streamName } });
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
    logger.trace(`Getting Value "${key}" from stream "${streamName}"`);
    const result = await this.getValues(streamName, key, 1);
    if (result.length !== 1) {
      const message = `Expected a single value, got: ${result || "nothing"}`;
      throw new TruBudgetError({
        kind: "NotFound",
        what: { message, streamName, key },
      });
    }
    return result[0];
  }

  public async setValue(streamName: StreamName, streamkey: StreamKey, object: any): Promise<void> {
    const data = objectToHex(object);
    return this.rpcClient.invokePublish(streamName, streamkey, data);
  }

  public async updateValue(
    streamName: StreamName,
    key: string,
    updateCallback: (_: Resource) => Resource,
  ): Promise<void> {
    logger.trace(`Updating Value "${key}" from stream "${streamName}"`);

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

  public async getLastBlockInfo(skip = 0): Promise<BlockInfo> {
    return this.rpcClient.invoke("getlastblockinfo", skip);
  }

  public async getPeerInfo(): Promise<PeerInfo[]> {
    return this.rpcClient.invoke("getpeerinfo");
  }

  public async ping(): Promise<any> {
    return this.rpcClient.invoke("ping");
  }

  public async listBlocksByHeight(
    to: number,
    from: number | string = 0,
    verbose = false,
  ): Promise<BlockListItem[]> {
    return this.rpcClient.invoke("listblocks", `${from}-${to}`, verbose);
  }

  public async listStreamBlockItemsByHeight(
    streamName: StreamName,
    to: number,
    from = 0,
    verbose = false,
  ): Promise<Liststreamkeyitems.Item[]> {
    return this.rpcClient
      .invoke("liststreamblockitems", streamName, `${from}-${to}`, verbose)
      .catch((err) => {
        if (err && err.code === -708) {
          throw new TruBudgetError({ kind: "NotFound", what: { stream: `stream ${streamName}` } });
        } else {
          throw err;
        }
      });
  }

  public async v2_readStreamItems(
    streamName: StreamName,
    key: string,
    nValues = maxItemCount,
  ): Promise<Liststreamkeyitems.Item[]> {
    if (nValues <= 0) {
      const message = `expected nValues > 0, got ${nValues}`;
      throw Error(message);
    }
    return this.rpcClient
      .invoke("liststreamkeyitems", streamName, key, false, nValues)
      .catch((err) => {
        if (err && err.code === -708) {
          throw new TruBudgetError({ kind: "NotFound", what: { stream: `stream ${streamName}` } });
        } else {
          throw err;
        }
      });
  }
}

const sleep = (timeout: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, timeout));
