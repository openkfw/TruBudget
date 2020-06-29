import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface ProjectResponse {
  apiVersion: string;
  data: {
    items: [{ data: Project }];
  };
}

export interface Project {
  id: string;
  creationUnixTs: string;
  status: string;
  displayName: string;
  description: string;
  assignee: string;
  projectedBudgets: [
    {
      organization: string;
      value: string;
      currencyCode: string;
    },
  ];
}

interface SubprojectResponse {
  apiVersion: string;
  data: {
    items: [{ data: Subproject }];
  };
}

export interface Subproject {
  id: string;
  creationUnixTs: string;
  status: string;
  displayName: string;
  description: string;
  assignee: string;
  currency: string;
  projectedBudgets: [
    {
      organization: string;
      value: string;
      currencyCode: string;
    },
  ];
  additionData: any;
}

interface WorkflowitemResponse {
  apiVersion: string;
  data: {
    workflowitems: [{ data: Workflowitem }];
  };
}

export interface Workflowitem {
  id: string;
  creationUnixTs: string;
  status: string;
  amountType: string;
  displayName: string;
  description: string;
  assignee: string;
  workflowitemType?: string;
  billingDate?: string;
  exchangeRate?: string;
  dueDate?: string;
  amount?: string;
  documents: [
    {
      id: string;
      hash: string;
    },
  ];
}

function getAuthHeader(token: string): AxiosRequestConfig {
  return {
    headers: {
      Authorization: token,
    },
  };
}

export async function getProjects(
  axios: AxiosInstance,
  token: string,
  base: string,
): Promise<Project[]> {
  const response: AxiosResponse<ProjectResponse> = await axios.get(
    `${base}/project.list`,
    getAuthHeader(token),
  );
  const projectList: Project[] = response.data.data.items.map((i) => i.data);
  return projectList;
}

export async function getSubprojects(
  axios: AxiosInstance,
  projectId: string,
  token: string,
  base: string,
): Promise<Subproject[]> {
  const response: AxiosResponse<SubprojectResponse> = await axios.get(
    `${base}/subproject.list?projectId=${projectId}`,
    getAuthHeader(token),
  );
  const subprojectList: Subproject[] = response.data.data.items.map((i) => i.data);
  return subprojectList;
}

export async function getWorkflowitems(
  axios: AxiosInstance,
  projectId: string,
  subprojectId: string,
  token: string,
  base: string,
): Promise<Workflowitem[]> {
  const response: AxiosResponse<WorkflowitemResponse> = await axios.get(
    `${base}/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}`,
    getAuthHeader(token),
  );
  const workflowitemList: Workflowitem[] = response.data.data.workflowitems.map((i) => i.data);
  return workflowitemList;
}
