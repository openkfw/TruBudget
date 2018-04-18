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
  kind: StreamKind;
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

// interface Project extends Resource {
//   data: ProjectData;
// }
// interface Workflowitem extends Resource {
//   data: WorkflowitemData;
// }

export interface MultichainClient {
  // Retrieve stream information:

  // Get a list of all streams:
  // streams(): Promise<Stream[]>;

  // Return the most recent values for all keys
  // streamItems(streamName: StreamName): Promise<StreamItem[]>;

  // Return the most recent values for a specific key
  latestValuesForKey(streamName: StreamName, key: string, nValues?: number): Promise<any[]>;

  // Update a stream item, serializing the Js object as hex-string:
  updateStreamItem(streamName: StreamName, keys: string | string[], object: any): Promise<void>;
}
