import { Permissions } from "../authz/types";
import * as Liststreamkeyitems from "./liststreamkeyitems";
import { RpcClient } from "./RpcClient";

export { RpcMultichainClient } from "./Client";
export type StreamKind =
  | "global"
  | "organization"
  | "users"
  | "project"
  | "subproject"
  | "notifications"
  | "nodes"
  | "groups";

// The "stream details" are read-only, so they're only used to define the stream's nature:
interface StreamDetails {
  kind?: StreamKind;
}

export type TxId = string;

export type StreamName = string;
export type StreamTxId = TxId;

export interface BlockInfo {
  hash: string;
  height: number;
  time: number;
  txcount: number;
  miner: string;
}

export interface BlockListItem extends BlockInfo {
  confirmations: number;
}

export interface Stream {
  name: StreamName;
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
  creationUnixTs: string;
  issuer: string;
  description?: string;
  action: string;
}

export interface CreateStreamOptions {
  kind: StreamKind;
  name?: string; // random if not given
}

export interface StreamItem {
  key: string;
  value: any;
}

export interface Resource {
  log: LogEntry[];
  permissions: Permissions;
  data: any;
}

export type StreamKey = string[];

export interface StreamItemPair {
  key: StreamKey;
  resource: Resource;
}

export interface MultichainClient {
  /**
   * Get the latest block, possibly skipping a few.
   *
   * @param skip number of blocks to skip, default 0 (= latest block)
   */
  getLastBlockInfo(skip?: number): Promise<BlockInfo>;

  /**
   * Retrieve all blocks metadata by block height range.
   * You can retrieve the current maximum block height through calling getLastBlockInfo
   *
   * @param to highest block height to return (inclusive)
   * @param from lowest block to return (inclusive), defaults to 0
   * @param verbose verbose output, defaults to false
   */
  listBlocksByHeight(to: number, from?: number, verbose?: boolean): Promise<BlockListItem[]>;

  // Create a new stream. If name is set and the stream exists, nothing happens.
  getOrCreateStream(options: CreateStreamOptions);

  // Get a list of (all) streams:
  streams(stream?: string): Promise<Stream[]>;

  // Return the most recent values for all keys
  streamItems(streamId: StreamName | StreamTxId): Promise<StreamItem[]>;

  // getinfo Returns general information about this node and blockchain
  // TODO add return types...although they seem rather flexible
  getInfo(): any;

  ping(): any;

  isValidAddress(address: string): Promise<any>;

  // Return the most recent values for a specific key
  latestValuesForKey(
    streamId: StreamName | StreamTxId,
    key: string,
    nValues?: number,
  ): Promise<any[]>;

  // Update a stream item, serializing the Js object as hex-string:
  updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string | string[],
    object: any,
  ): Promise<TxId>;

  // Return all (historic) values of the nValues latest stream items, filtered by a given key:
  getValues(streamName: StreamName, key: string, nValues?: number): Promise<StreamItemPair[]>;

  // Return only the latest values of the nValues latest stream items, filtered by a given key:
  getLatestValues(streamName: StreamName, key: string, nValues?: number): Promise<StreamItemPair[]>;

  // Return a single value for a specific key or throw if not found:
  getValue(streamName: StreamName, key: string): Promise<StreamItemPair>;

  // Update a stream item, serializing the Js object as hex-string:
  setValue(streamName: StreamName, streamKey: StreamKey, object: any): Promise<void>;

  updateValue(
    streamName: StreamName,
    key: string,
    updateCallback: (current: Resource) => Resource,
  ): Promise<void>;

  getRpcClient(): RpcClient;

  v2_readStreamItems(
    streamName: StreamName,
    key: string,
    nValues?: number,
  ): Promise<Liststreamkeyitems.Item[]>;

  /**
   * Retrieve all items within a stream by block height range.
   *
   * @param streamName Stream Name to Read
   * @param to Highest block height to retrieve (inclusive)
   * @param from Lowest block height to retrieve (inclusive), defaults to 0
   * @param verbose Get verbose data (not typed!)
   */
  listStreamBlockItemsByHeight(
    streamName: StreamName,
    to: number,
    from?: number,
    verbose?: boolean,
  ): Promise<Liststreamkeyitems.Item[]>;
}
