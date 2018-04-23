import Intent from "../authz/intents";
import { MultichainClient, Resource } from "../multichain/Client.h";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent } from "../authz/types";

const workflowitemsKey = subprojectId => `${subprojectId}_workflows`;

export interface WorkflowitemResource extends Resource {
  data: WorkflowitemData;
}

export interface WorkflowitemData {
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

export interface WorkflowitemUserView extends WorkflowitemData {
  allowedIntents: Intent[];
}

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  permissions: AllowedUserGroupsByIntent,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
  displayName: string,
  amount: number,
  currency: string,
  amountType: "N/A" | "disbursed" | "allocated",
  description: string,
  status: "open" | "closed",
  documents: Document[],
  previousWorkflowitemId?: string
): Promise<void> => {
  const resource: WorkflowitemResource = {
    data: {
      id: workflowitemId,
      displayName,
      amount,
      currency,
      amountType,
      description,
      status,
      documents,
      previousWorkflowitemId
    },
    log: [{ issuer: token.userId, action: "workflowitem_created" }],
    permissions
  };
  return multichain.setValue(projectId, [workflowitemsKey(subprojectId), workflowitemId], resource);
};
