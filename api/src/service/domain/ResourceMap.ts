export type Resource = "project" | "subproject" | "workflowitem";

export type ResourceMap = { [key in Resource]?: { id: string } };
