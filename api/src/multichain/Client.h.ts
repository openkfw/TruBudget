import { AllowedUserGroupsByIntent } from "../authz/types";
export { RpcMultichainClient } from "./Client";

type StreamKind = "project" | "subproject";

// The "stream details" are read-only, so they're only used to define the stream's nature:
interface StreamDetails {
  kind?: StreamKind;
}

export type StreamTxId = string;

export interface Stream {
  name: string;
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

export interface ProjectStreamMetadata {
  creationUnixTs: string;
  status: "open" | "done";
  name: string;
  description?: string;
  amount: string;
  currency: string;
  thumbnail?: string;
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

export interface MultichainClient {
  createStream(options: CreateStreamOptions);
  streams(): Promise<Stream[]>;
  streamBody(stream: Stream): Promise<StreamBody>;
}
