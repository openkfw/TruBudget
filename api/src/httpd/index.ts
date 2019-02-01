import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";

export type ProjectReader = (token: AuthToken, id: string) => Promise<Project>;

export type AllProjectsReader = (token: AuthToken) => Promise<Project[]>;
export type AllWorkflowitemsReader = (
  token: AuthToken,
  projectId: string,
  subprojectId: string,
) => Promise<Workflowitem[]>;

export type ProjectAssigner = (
  token: AuthToken,
  projectId: string,
  assignee: string,
) => Promise<void>;

export type ProjectUpdater = (token: AuthToken, projectId: string, update: object) => Promise<void>;

type MaybeHistoryEvent = null | {
  intent: Intent;
  snapshot: {
    displayName: string;
    permissions?: object;
  };
};

export type WorkflowitemCloser = (
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
) => Promise<void>;

export type WorkflowitemUpdater = (
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  // TODO find better type
  updatedData: any,
) => Promise<void>;

export interface Project {
  log: MaybeHistoryEvent[];
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    status: "open" | "closed";
    displayName: string;
    assignee?: string;
    description: string;
    amount: string;
    currency: string;
    thumbnail: string;
  };
}

export interface Workflowitem {
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    displayName: string;
    exchangeRate?: string;
    billingDate?: string;
    amount?: string;
    currency?: string;
    amountType: "N/A" | "disbursed" | "allocated";
    description: string;
    status: "open" | "closed";
    assignee?: string;
    documents?: Document[];
  };
}
