/*
 * Resource: Project
 */

export interface CreateProject {
  intent: "create project";
}

export interface ListProjects {
  intent: "list projects";
}

export interface ViewProject {
  intent: "view project";
  projectId: string;
}

export interface ListSubprojects {
  intent: "list subprojects";
  projectId: string;
}

export interface AppendSubproject {
  intent: "append subproject to project";
  projectId: string;
}

/*
 * Resource: Subproject
 */

export interface ViewSubproject {
  intent: "view subproject";
  projectId: string;
  subprojectId: string;
}

export interface AppendWorkflow {
  intent: "append workflow to subproject";
  projectId: string;
  subprojectId: string;
}

/*
 * All intents exported as sum-type:
 */

export type Intent =
  | CreateProject
  | ListProjects
  | ViewProject
  | ListSubprojects
  | AppendSubproject
  | ViewSubproject
  | AppendWorkflow;
