import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";

export type ProjectReader = (token: AuthToken, id: string) => Promise<ProjectAndSubprojects>;

export type AllProjectsReader = (token: AuthToken) => Promise<Project[]>;

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

export interface ProjectAndSubprojects {
  project: Project;
  subprojects: [
    {
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
  ];
}
