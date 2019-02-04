import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";

export type Permissions = { [key in Intent]?: string[] };

export type ProjectReader = (token: AuthToken, id: string) => Promise<ProjectAndSubprojects>;

export type AllProjectsReader = (token: AuthToken) => Promise<Project[]>;
export type AllWorkflowitemsReader = (
  token: AuthToken,
  projectId: string,
  subprojectId: string,
) => Promise<Workflowitem[]>;

export type AllPermissionsReader = (token: AuthToken) => Promise<Permissions>;

export type GlobalPermissionGranter = (
  token: AuthToken,
  grantee: string,
  intent: Intent,
) => Promise<void>;

export type AllPermissionsGranter = (token: AuthToken, grantee: string) => Promise<void>;

export type GlobalPermissionRevoker = (
  token: AuthToken,
  recipient: string,
  intent: Intent,
) => Promise<void>;

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
export interface ProjectAndSubprojects {
  project: Project;
  subprojects: Subproject[];
}
export interface Workflowitem {
  allowedIntents: Intent[];
  data: {
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

interface Subproject {
  allowedIntents: Intent[];
  data: {
    id: string;
    creationUnixTs: string;
    status: "open" | "closed";
    displayName: string;
    description: string;
    amount: string;
    currency: string;
    exchangeRate: string;
    billingDate: string;
    assignee?: string;
  };
}
