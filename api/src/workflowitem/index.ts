import { Workflowitem } from "./Workflowitem";

export interface WorkflowitemAPI {
  getWorkflowitemList(
    workflowitemLister: WorkflowitemLister,
    projectId: string,
    subprojectId: string,
    user: string,
  ): Promise<Workflowitem[]>;
}
export interface WorkflowitemLister {
  getWorkflowitemList(projectId: string, subprojectId: string): Promise<Workflowitem[]>;
  getWorkflowitemOrdering(): Promise<string[]>;
}

export class WorkflowitemService implements WorkflowitemAPI {
  public async getWorkflowitemList(
    workflowitemLister: WorkflowitemLister,
    projectId: string,
    subprojectId: string,
    user: string,
  ): Promise<Workflowitem[]> {
    const workflowitemOrdering = workflowitemLister.getWorkflowitemOrdering();
    const workflowitems = await workflowitemLister.getWorkflowitemList(projectId, subprojectId);
    const authorizedWorkflowitems = await workflowitems.filter(workflowitem =>
      isWorkflowitemVisibleTo(workflowitem, user),
    );
    return Promise.resolve([]);
  }

  public async getWorkflowitemOrdering(): Promise<string[]> {
    return Promise.resolve([]);
  }
}
