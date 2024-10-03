import Intent from "../authz/intents";

import { Stream } from "./Client.h";
import Type from "./domain/workflowitem_types/types";

type StreamName = string;
type StreamCursor = { txid: string; index: number };

export type Cache = {
  // A lock is used to prevent sourcing updates concurrently:
  isWriteLocked: boolean;
  // How recent the cache is, in MultiChain terms:
  streamState: Map<StreamName, StreamCursor>;
  // Cached project streams, to be invalidated regularly and after project.create:
  projectStreams?: Stream[];
  // The cached content:
  projects: Map<string, Project>;
};

export function initCache(): Cache {
  return {
    isWriteLocked: false,
    streamState: new Map(),
    projectStreams: undefined,
    projects: new Map(),
  };
}

interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  projectedBudgets: ProjectedBudget[];
  thumbnail: string;
  permissions: Permissions;
  log: HistoryEvent[];
  subprojects: Map<string, Subproject>;
}

interface Subproject {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee?: string;
  currency: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: HistoryEvent[];
  workflowitems: Map<string, Workflowitem>;
}

interface Workflowitem {
  id: string;
  creationUnixTs: string;
  displayName: string;
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  amount?: string;
  currency?: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  assignee?: string;
  documents?: Document[];
  permissions: Permissions;
  log: HistoryEvent[];
  workflowitemType?: Type;
}

interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

interface HistoryEvent {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: unknown;
  snapshot: {
    displayName: string;
  };
}
