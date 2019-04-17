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
    }
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
    }
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
  billingDate?: string;
  exchangeRate?: string;
  amount?: string;
  documents: [
    {
      id: string;
      hash: string;
    }
  ];
}

function getAuthHeader(token: string): AxiosRequestConfig {
  return {
    headers: {
      Authorization: token,
    },
  };
}

export async function getProjects(axios: AxiosInstance, token: string): Promise<Project[]> {
  const response: AxiosResponse<ProjectResponse> = await axios.get(
    "/project.list",
    getAuthHeader(token),
  );
  const projectList: Project[] = response.data.data.items.map(i => i.data);
  return projectList;
}

export async function getSubprojects(
  axios: AxiosInstance,
  projectId: string,
  token: string,
): Promise<Subproject[]> {
  const response: AxiosResponse<SubprojectResponse> = await axios.get(
    `/subproject.list?projectId=${projectId}`,
    getAuthHeader(token),
  );
  const subprojectList: Subproject[] = response.data.data.items.map(i => i.data);
  return subprojectList;
}

export async function getWorkflowitems(
  axios: AxiosInstance,
  projectId: string,
  subprojectId: string,
  token: string,
): Promise<Workflowitem[]> {
  const response: AxiosResponse<WorkflowitemResponse> = await axios.get(
    `/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}`,
    getAuthHeader(token),
  );
  const workflowitemList: Workflowitem[] = response.data.data.workflowitems.map(i => i.data);
  return workflowitemList;
}
