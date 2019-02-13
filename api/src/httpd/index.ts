import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";

export interface Document {
  id: string;
  hash: string;
}

export type Permissions = { [key in Intent]?: string[] };

export type ProjectReader = (token: AuthToken, id: string) => Promise<ProjectAndSubprojects>;

export type AllProjectsReader = (token: AuthToken) => Promise<Project[]>;
export type AllWorkflowitemsReader = (
  token: AuthToken,
  projectId: string,
  subprojectId: string,
) => Promise<Workflowitem[]>;

export type AllPermissionsReader = (token: AuthToken) => Promise<Permissions>;

export type ProjectPermissionsReader = (
  token: AuthToken,
  projectId: string,
) => Promise<Permissions>;

export type ProjectPermissionsGranter = (
  token: AuthToken,
  projectId: string,
  grantee: string,
  intent: Intent,
) => Promise<void>;

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

export type ProjectCreator = (token: AuthToken, payload: CreateProjectPayload) => Promise<void>;

export type ProjectAssigner = (
  token: AuthToken,
  projectId: string,
  assignee: string,
) => Promise<void>;

export type ProjectUpdater = (token: AuthToken, projectId: string, update: object) => Promise<void>;

type MaybeHistoryEvent = null | {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
  snapshot: {
    displayName: string;
  };
};

export interface CreateProjectPayload {
  displayName: string;
  description: string;
  amount: string;
  currency: string;
  id?: string;
  creationUnixTs?: string;
  status?: "open" | "closed";
  assignee?: string;
  thumbnail?: string;
}
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
  updatedData: any,
) => Promise<void>;

export type WorkflowitemAssigner = (
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  newAssignee: string,
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
    displayName: string | null;
    exchangeRate?: string | null;
    billingDate?: string | null;
    amount?: string | null;
    currency?: string | null;
    amountType: "N/A" | "disbursed" | "allocated" | null;
    description: string | null;
    status: "open" | "closed";
    assignee?: string | null;
    documents?: Document[] | null;
  };
}
export interface ProjectAndSubprojects {
  project: Project;
  subprojects: Subproject[];
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
