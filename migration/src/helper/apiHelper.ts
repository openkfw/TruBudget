import axios, {AxiosInstance, AxiosResponse} from "axios";

import {UploadedDocument} from "../customMigration/migrateDocuments/migrateOffChainDocuments";
import ApplicationConfiguration from "./config";

export interface UploadMetadata {
  projectId: string;
  subprojectId: string;
  workflowitemId: string;
  documents: UploadedDocument[];
}

export interface WorkflowItemDetails {
  id: string;
  creationUnixTs: string;
  status: string;
  amountType: string;
  displayName: string;
  description: string;
  amount: string;
  assignee: string;
  currency: string;
  additionalData: any;
  workflowitemType: string;
  documents: WorkflowItemDetailsDocument[];
}

export interface WorkflowItemDetailsDocument {
  hash: string;
  fileName: string;
  id: string;
  available: boolean;
}

export const workflowitemIntents = [
  "workflowitem.intent.listPermissions",
  "workflowitem.intent.grantPermission",
  "workflowitem.intent.revokePermission",
  "workflowitem.list",
  "workflowitem.viewHistory",
  "workflowitem.assign",
  "workflowitem.update",
  "workflowitem.close",
];

const apiInstances = new Map<String, AxiosInstance>();

const apiIsReady = async (apiBaseUrl: string): Promise<boolean> => {
  try {
    console.log("Check if Api is ready...");
    const response: AxiosResponse = await axios.get(
      `${apiBaseUrl}/api/readiness`,
      {timeout: 5000}
    );
    return response.status === 200;
  } catch (error) {
    console.log(`Api (${apiBaseUrl}) not reachable.`);
    return false;
  }
};

const waitForApi = async (delayInS: number, maxRetries: number = 50) => {
  let retries = 0;
  while (retries < maxRetries) {
    if (await apiIsReady(ApplicationConfiguration.DESTINATION_API_BASE_URL)) {
      console.log("Api reports readiness!");
      return;
    } else {
      console.log(`Retry in ${delayInS} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delayInS * 1000));
    }
    retries++;
  }
  console.log(`Max retries of ${maxRetries} reached. Api not ready. Exit.`);
  process.exit(1);
};

export const getApiInstanceForUser = async (
  username: string,
  password: string
): Promise<AxiosInstance> => {
  await waitForApi(10, 50);
  const apiInstance = apiInstances.get(username);
  if (apiInstance) return apiInstance;

  const newApiInstanceForUser = await authAgainstApi(username, password);
  apiInstances.set(username, newApiInstanceForUser);
  return newApiInstanceForUser;
};

const authAgainstApi = async (
  username: string,
  password: string
): Promise<AxiosInstance> => {
  try {
    console.log("Authenticate with root user");
    const auth = await axios.post(
      `${ApplicationConfiguration.DESTINATION_API_BASE_URL}/api/user.authenticate`,
      {
        apiVersion: "1.0",
        data: {
          user: {
            id: username,
            password,
          },
        },
      }
    );
    if (auth.status !== 200) {
      throw new Error("Can not authenticate user!");
    }
    if (auth.headers["set-cookie"]) {
      const token = auth.headers["set-cookie"][0].split(";")[0].replace("token=", "");
      return axios.create({
        baseURL: `${ApplicationConfiguration.DESTINATION_API_BASE_URL}/api`,
        headers: {Authorization: `Bearer ${token}`},
      });
    }
    throw new Error("Can not authenticate user auth-header is missing!");

  } catch (error) {
    throw new Error(
      `Can not authenticate user! Request failed wit status ${error}`
    );
  }
};

export const uploadViaApi = async (
  api: AxiosInstance,
  metadata: UploadMetadata
) => {
  const {projectId, subprojectId, workflowitemId, documents} = metadata;

  const request = await api.post("/workflowitem.update", {
    apiVersion: "1.0",
    data: {
      projectId,
      subprojectId,
      workflowitemId,
      documents,
    },
  });
  if (request.status !== 200) {
    throw new Error(
      `Error while performing upload to destination for files ${documents} to destination`
    );
  }
};

export const downloadFileFromStorageService = async (
  storageServiceUrl: string,
  docId: string,
  secret: string
): Promise<string> => {
  console.log("download from storage", docId, storageServiceUrl, secret);
  const response = await axios.get(`${storageServiceUrl}/download`, {
    params: {docId},
    headers: {SECRET: secret},
  });
  if (response.status !== 200) {
    throw new Error(
      `Error while performing download from storage service of document ${docId}`
    );
  }
  return response.data.data;
};

export const downloadFileFromApi = async (
  api: AxiosInstance,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  documentId: string
) => {
  const request = await api.get(
    `/workflowitem.downloadDocument?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}&documentId=${documentId}`
  );

  if (request.status !== 200) {
    throw new Error("Can not download file!");
  }
  return request.data;
};

export const getWorkflowItemDetails = async (
  api: AxiosInstance,
  projectId: string,
  subprojectId: string,
  workflowitemId: string
): Promise<WorkflowItemDetails> => {
  const request = await api.get(
    `/workflowitem.viewDetails?projectId=${projectId}&subprojectId=${subprojectId}&workflowitemId=${workflowitemId}`
  );

  if (request.status !== 200) {
    throw new Error("Can not download file!");
  }
  return <WorkflowItemDetails>request.data.data.workflowitem.data;
};

export const createUser = async (
  api: AxiosInstance,
  displayName: string,
  organization: string,
  username: string,
  password: string
): Promise<string> => {
  const request = await api.post(`/global.createUser`, {
    apiVersion: "1.0",
    data: {
      user: {
        displayName,
        organization,
        id: username,
        password,
      },
    },
  });

  if (request.status !== 200) {
    throw new Error(`Can not create user ${username}`);
  }

  return request.data.data.user.id;
};

export const disableUser = async (
  api: AxiosInstance,
  userId: string
): Promise<void> => {
  const request = await api.post(`/global.disableUser`, {
    apiVersion: "1.0",
    data: {
      userId,
    },
  });

  if (request.status !== 200) {
    throw new Error(`Can not disable user ${userId}`);
  }
};

export const grantAllRightsToUser = async (
  api: AxiosInstance,
  userId: string
): Promise<void> => {
  const request = await api.post(`/global.grantAllPermissions`, {
    apiVersion: "1.0",
    data: {
      identity: userId,
    },
  });

  if (request.status !== 200) {
    throw new Error(`Can not grant all rights to user ${userId}`);
  }
};

export const grantAllPermissionsOnWorkflowItem = async (
  api: AxiosInstance,
  userId: string,
  projectId: string,
  subprojectId: string,
  workflowitemId
): Promise<void> => {
  for (const intent of workflowitemIntents) {
    const request = await api.post(`/workflowitem.intent.grantPermission`, {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        identity: userId,
        intent,
      },
    });

    if (request.status !== 200) {
      throw new Error(`Can not grant rights to user ${userId}`);
    }
  }
};

export const revokeAllPermissionsOnWorkflowItem = async (
  api: AxiosInstance,
  userId: string,
  projectId: string,
  subprojectId: string,
  workflowitemId
): Promise<void> => {
  for (const intent of workflowitemIntents) {
    const request = await api.post(`/workflowitem.intent.revokePermission`, {
      apiVersion: "1.0",
      data: {
        projectId,
        subprojectId,
        workflowitemId,
        identity: userId,
        intent,
      },
    });

    if (request.status !== 200) {
      throw new Error(`Can not revoke rights to user ${userId}`);
    }
  }
};

export const listUsers = async (
  api: AxiosInstance
): Promise<
  [
    {
      username: string;
      userId: string;
    }
  ]
> => {
  const request = await api.get(`/user.list`);

  if (request.status !== 200) {
    throw new Error(`Can not list users`);
  }

  return request.data.data.items.map((el) => {
    return {
      username: el.displayName,
      userId: el.id,
    };
  });
};
