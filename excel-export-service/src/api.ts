import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import logger from "./logger";

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
  workflowitemType?: string;
  currency: string;
  projectedBudgets: [
    {
      organization: string;
      value: string;
      currencyCode: string;
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  rejectReason?: string;
  documents: [
    {
      id: string;
      hash: string;
    },
  ];
}

function getAuthHeader(token: string): AxiosRequestConfig {
  logger.trace("Fetching Auth Header ...");
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
  logger.trace("Fetching projects ...");
  const response: AxiosResponse<ProjectResponse> = await axios
    .get(`${base}/project.list`, getAuthHeader(token))
    .catch(function (error) {
      logger.error(error);
      throw error;
    });
  const projectList: Project[] = response.data.data.items.map((i) => i.data);
  return projectList;
}

export async function getSubprojects(
  axios: AxiosInstance,
  projectId: string,
  token: string,
  base: string,
): Promise<Subproject[]> {
  logger.trace("Fetching subprojects ...");
  const response: AxiosResponse<SubprojectResponse> = await axios
    .get(`${base}/subproject.list?projectId=${projectId}`, getAuthHeader(token))
    .catch(function (error) {
      logger.error({ err: error }, "Error while getting subprojects");
      throw error;
    });
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
  logger.trace("Fetching workflowitems ...");
  const response: AxiosResponse<WorkflowitemResponse> = await axios
    .get(
      `${base}/workflowitem.list?projectId=${projectId}&subprojectId=${subprojectId}`,
      getAuthHeader(token),
    )
    .catch(function (error) {
      logger.error({ err: error }, "Error while getting workflowitems");
      throw error;
    });
  const workflowitemList: Workflowitem[] = response.data.data.workflowitems.map((i) => i.data);
  return workflowitemList;
}

export async function getApiReadiness(axios: AxiosInstance, base: string) {
  logger.trace("Fetching readiness ...");
  return axios.get(`${base}/readiness`);
}

export async function getApiVersion(
  axios: AxiosInstance,
  token: string,
  base: string,
): Promise<string> {
  logger.trace("Fetching api version ...");
  const response: AxiosResponse<string> = await axios.get(`${base}/version`, getAuthHeader(token));
  return response.data;
}
