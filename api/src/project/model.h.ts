import { AllowedUserGroupsByIntent } from "../authz/types";
import { LogEntry, Stream } from "../multichain/Client.h";
import Intent from "../authz/intents";

export interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "done";
  displayName: string;
  description?: string;
  amount: string;
  currency: string;
  thumbnail?: string;
  permissions?: AllowedUserGroupsByIntent;
  logs?: LogEntry[];
}

export interface ProjectStreamMetadata {
  displayName: string;
  creationUnixTs: string;
  status: "open" | "done";
  description?: string;
  amount: string;
  currency: string;
  thumbnail?: string;
}

export interface ProjectResponse {
  id: string;
  creationUnixTs: string;
  status: "open" | "done";
  displayName: string;
  description?: string;
  amount: string;
  currency: string;
  thumbnail?: string;
  allowedIntents: Intent[];
  logs?: LogEntry[];
}
