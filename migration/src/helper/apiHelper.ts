import axios, {AxiosInstance} from "axios";
import ApplicationConfiguration from "./config";

export interface UploadMetadata {
    projectId: string;
    subprojectId: string;
    workflowitemId: string;
    fileMetadata: {
        document: { id: string; base64: string; fileName: string };
    };
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
    "workflowitem.view",
    "workflowitem.viewHistory",
    "workflowitem.assign",
    "workflowitem.update",
    "workflowitem.close",
];

const apiInstances = new Map<String, AxiosInstance>();

export const getApiInstanceForUser = async (
    username: string,
    password: string
): Promise<AxiosInstance> => {
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
        const token = auth.data.data.user.token;
        return axios.create({
            baseURL: `${ApplicationConfiguration.DESTINATION_API_BASE_URL}/api`,
            headers: {Authorization: `Bearer ${token}`},
        });
    } catch (error) {
        throw new Error(
            `Can not authenticate user! Request failed with: ${error}`
        );
    }
};

export const uploadViaApi = async (
    api: AxiosInstance,
    metadata: UploadMetadata
) => {
    const {projectId, subprojectId, workflowitemId, fileMetadata} = metadata;

    const request = await api.post("/workflowitem.update", {
        apiVersion: "1.0",
        data: {
            projectId,
            subprojectId,
            workflowitemId,
            documents: [fileMetadata.document],
        },
    });
    if (request.status !== 200) {
        throw new Error(
            `Error while performing upload to destination for file ${fileMetadata.document.fileName} to destination`
        );
    }
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

export const listUsers = async (
    api: AxiosInstance
): Promise<[
    {
        username: string;
        userId: string;
    }
]> => {
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
