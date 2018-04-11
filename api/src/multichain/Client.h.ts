import { AllowedUserGroupsByIntent } from "../authz/types";
import { ProjectStreamMetadata } from "../project/model";
export { RpcMultichainClient } from "./Client";

type StreamKind = "users" | "project" | "subproject";

// The "stream details" are read-only, so they're only used to define the stream's nature:
interface StreamDetails {
  kind?: StreamKind;
}

export type StreamName = string;
export type StreamTxId = string;

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
  log?: LogEntry;
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
  txid: string;
}

export interface MultichainClient {
  // Create a new stream. If name is set and the stream exists, nothing happens.
  createStream(options: CreateStreamOptions);

  // Get a list of all streams:
  streams(): Promise<Stream[]>;

  // Get the stream body (some of its key/value pairs) of a given stream:
  streamBody(stream: Stream): Promise<StreamBody>;

  // Returns a specific item from a stream, or throws if no such item is found:
  streamItem(streamId: StreamName | StreamTxId, key: string): Promise<StreamItem>;

  // Update a stream item, serializing the Js object as hex-string:
  updateStreamItem(
    streamId: StreamName | StreamTxId,
    key: string,
    object: any
  ): Promise<StreamItem>;
}
