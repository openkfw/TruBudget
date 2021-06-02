export type Resource = "project" | "subproject" | "workflowitem";

export interface Document {
  fileName: string;
  id: string;
}

export type ResourceMap = { [key in Resource]?: { id: string; documents?: Document[] } };
