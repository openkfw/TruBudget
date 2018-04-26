import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent, People } from "../../authz/types";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { getAllowedIntents } from "../../authz/index";
import { ignoringStreamNotFound } from "../lib";

/** The multichain-item key used to identify subprojects. */
const SUBPROJECTS_KEY = "subprojects";

export interface SubprojectResource extends Resource {
  data: SubprojectData;
}

export interface SubprojectData {
  id: string;
  creationUnixTs: string;
  status: string;
  displayName: string;
  description: string;
  amount: string;
  currency: string;
}

export interface SubprojectDataWithIntents extends SubprojectData {
  allowedIntents: Intent[];
}

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const streamItem = await multichain.getValue(projectId, subprojectId);
  return streamItem.resource.permissions;
};

export const grantPermission = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  userId: string,
  intent: Intent
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, subprojectId);
  const subproject = streamItem.resource;
  const permissionsForIntent: People = subproject.permissions[intent] || [];

  if (permissionsForIntent.includes(userId)) {
    // The given user is already permitted to execute the given intent.
    return;
  }
  permissionsForIntent.push(userId);

  subproject.permissions[intent] = permissionsForIntent;
  await multichain.setValue(projectId, streamItem.key, subproject);
};

export const revokePermission = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  userId: string,
  intent: Intent
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, subprojectId);
  const subproject = streamItem.resource;
  const permissionsForIntent: People = subproject.permissions[intent] || [];

  const userIndex = permissionsForIntent.indexOf(userId);
  if (userIndex === -1) {
    // The given user has no permissions to execute the given intent.
    // Note: a user could still belong to a group that has access rights!
    return;
  }
  // Remove the user from the array:
  permissionsForIntent.splice(userIndex, 1);

  subproject.permissions[intent] = permissionsForIntent;
  await multichain.setValue(projectId, streamItem.key, subproject);
};

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  permissions: AllowedUserGroupsByIntent,
  data: {
    id: string;
    displayName: string;
    amount: string;
    currency: string;
    description: string;
  }
): Promise<void> => {
  const subprojectId = data.id;
  const creationUnixTs = Date.now().toString();
  const resource: SubprojectResource = {
    data: {
      id: subprojectId,
      creationUnixTs,
      status: "open",
      displayName: data.displayName,
      description: data.description,
      amount: data.amount,
      currency: data.currency
    },
    log: [{ creationUnixTs, issuer: token.userId, action: "subproject_created" }],
    permissions
  };
  return multichain.setValue(projectId, [SUBPROJECTS_KEY, subprojectId], resource);
};

export const getForUser = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId: string
): Promise<SubprojectDataWithIntents> => {
  const streamItem = await multichain.getValue(projectId, subprojectId);
  const resource = streamItem.resource;
  return {
    ...resource.data,
    allowedIntents: await getAllowedIntents(token, resource.permissions)
  };
};

export const getAll = async (
  multichain: MultichainClient,
  projectId: string
): Promise<SubprojectResource[]> => {
  const streamItems = await multichain.getLatestValues(projectId, SUBPROJECTS_KEY);
  return streamItems.map(item => item.resource);
};

export const getAllForUser = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string
): Promise<SubprojectDataWithIntents[]> => {
  const resources = await getAll(multichain, projectId);
  return Promise.all(
    resources.map(async resource => {
      return {
        ...resource.data,
        allowedIntents: await getAllowedIntents(token, resource.permissions)
      };
    })
  );
};
