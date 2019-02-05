import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";

export type ProjectReader = (token: AuthToken, id: string) => Promise<Project>;

export type AllProjectsReader = (token: AuthToken) => Promise<Project[]>;

export type AllPermissionsReader = (token: AuthToken) => Promise<Permissions>;

export type GlobalPermissionGranter = (
  token: AuthToken,
  userId: string,
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
  intent: Intent;
  snapshot: {
    displayName: string;
    permissions?: object;
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

export type Permissions = { [key in Intent]?: string[] };
