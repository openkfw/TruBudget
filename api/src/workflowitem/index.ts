import Intent from "../authz/intents";
import { MultichainClient, Resource } from "../multichain/Client.h";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";
import { getAllowedIntents } from "../authz";

const workflowitemsKey = subprojectId => `${subprojectId}_workflows`;

interface WorkflowitemResource extends Resource {
  data: Data;
}

export interface Data {
  id: string;
  displayName: string;
  amount: number;
  currency: string;
  amountType: "N/A" | "disbursed" | "allocated";
  description: string;
  status: "open" | "closed";
  documents: Document[];
  previousWorkflowitemId?: string;
}

export interface Document {
  description: string;
  hash: string;
}

export interface DataWithIntents extends Data {
  allowedIntents: Intent[];
}

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string,
  data: Data,
  permissions: AllowedUserGroupsByIntent
): Promise<void> => {
  const resource: WorkflowitemResource = {
    data: data,
    log: [{ issuer: token.userId, action: "workflowitem_created" }],
    permissions
  };
  return multichain.setValue(projectId, [workflowitemsKey(subprojectId), data.id], resource);
};

const getAll = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string
): Promise<WorkflowitemResource[]> => {
  const workflowitems = (await multichain.getValues(
    projectId,
    workflowitemsKey(subprojectId)
  )) as WorkflowitemResource[];
  return workflowitems;
};

export const getAllForUser = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string
): Promise<DataWithIntents[]> => {
  const resources = await getAll(multichain, projectId, subprojectId);
  return Promise.all(
    resources.map(async resource => {
      return {
        ...resource.data,
        allowedIntents: await getAllowedIntents(token, resource.permissions)
      };
    })
  );
};
