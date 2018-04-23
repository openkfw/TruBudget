import { AllowedUserGroupsByIntent } from "../authz/types";
import { ProjectStreamMetadata } from "../project/model.h";
export { RpcMultichainClient } from "./Client";

export type StreamKind = "global" | "users" | "project" | "subproject";

// The "stream details" are read-only, so they're only used to define the stream's nature:
interface StreamDetails {
  kind?: StreamKind;
}

export type TxId = string;

export type StreamName = string;
export type StreamTxId = TxId;

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
  issuer: string;
  description?: string;
  action: string;
}

// (Writable) metadata:
export type StreamMetadata = ProjectStreamMetadata;
// Current view on a stream:
export interface StreamBody {
  metadata?: StreamMetadata;
  log?: LogEntry[];
  permissions?: AllowedUserGroupsByIntent;
}

export interface CreateStreamOptions {
  kind: StreamKind;
  name?: string; // random if not given
  metadata?: StreamMetadata;
  initialLogEntry?: LogEntry;
  extraLogEntries?: { streamName: string; entry: LogEntry }[];
  permissions?: AllowedUserGroupsByIntent;
}

export interface StreamItem {
  key: string;
  value: any;
}

export interface Resource {
  log: LogEntry[];
  permissions: AllowedUserGroupsByIntent;
  data: any;
}

export interface MultichainClient {
  // Create a new stream. If name is set and the stream exists, nothing happens.
  getOrCreateStream(options: CreateStreamOptions);

  // Get a list of all streams:
  streams(): Promise<Stream[]>;

  // Return the most recent values for all keys
  streamItems(streamId: StreamName | StreamTxId): Promise<StreamItem[]>;

  // Return the most recent values for a specific key
  latestValuesForKey(
    streamId: StreamName | StreamTxId,
    key: string,
    nValues?: number
  ): Promise<any[]>;

  // Update a stream item, serializing the Js object as hex-string:
  updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string | string[],
    object: any
  ): Promise<TxId>;

  // Return (all) values for a specific key:
  getValues(streamName: StreamName, key: string, nValues?: number): Promise<any[]>;

  // Update a stream item, serializing the Js object as hex-string:
  setValue(streamName: StreamName, keys: string | string[], object: any): Promise<void>;
}
