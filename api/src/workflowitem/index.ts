import Intent from "../authz/intents";
import { MultichainClient, Resource } from "../multichain/Client.h";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import { getAllowedIntents } from "../authz";

const workflowitemsGroupKey = subprojectId => `${subprojectId}_workflows`;

const workflowitemKey = (subprojectId, workflowitemId) => [
  workflowitemsGroupKey(subprojectId),
  workflowitemId
];

interface WorkflowitemResource extends Resource {
  data: Data;
}

export interface Data {
  id: string;
  creationUnixTs: string;
  displayName: string;
  amount: string;
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
  return multichain.setValue(projectId, workflowitemKey(subprojectId, data.id), resource);
};

const getAll = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string
): Promise<WorkflowitemResource[]> => {
  const streamItems = await multichain.getLatestValues(
    projectId,
    workflowitemsGroupKey(subprojectId)
  );
  return streamItems.map(x => x.resource);
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

export const close = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, workflowitemId);

  if (streamItem.resource.data.status === "closed") {
    // Already closed, no need to update.
    return;
  }

  // Update the item's status:
  streamItem.resource.data.status = "closed";

  await multichain.setValue(projectId, streamItem.key, streamItem.resource);
};

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string
): Promise<AllowedUserGroupsByIntent> => {
  const streamItem = await multichain.getValue(projectId, workflowitemId);
  return streamItem.resource.permissions;
};

export const grantPermission = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
  userId: string,
  intent: Intent
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, workflowitemId);
  const workflowitem = streamItem.resource;
  const permissionsForIntent: People = workflowitem.permissions[intent] || [];

  if (permissionsForIntent.includes(userId)) {
    // The given user is already permitted to execute the given intent.
    return;
  }
  permissionsForIntent.push(userId);

  workflowitem.permissions[intent] = permissionsForIntent;
  await multichain.setValue(projectId, streamItem.key, workflowitem);
};

export const revokePermission = async (
  multichain: MultichainClient,
  projectId: string,
  workflowitemId: string,
  userId: string,
  intent: Intent
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, workflowitemId);
  const workflowitem = streamItem.resource;
  const permissionsForIntent: People = workflowitem.permissions[intent] || [];

  const userIndex = permissionsForIntent.indexOf(userId);
  if (userIndex === -1) {
    // The given user has no permissions to execute the given intent.
    // Note: a user could still belong to a group that has access rights!
    return;
  }
  // Remove the user from the array:
  permissionsForIntent.splice(userIndex, 1);

  workflowitem.permissions[intent] = permissionsForIntent;
  await multichain.setValue(projectId, streamItem.key, workflowitem);
};
