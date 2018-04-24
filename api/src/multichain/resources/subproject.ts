import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";
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
  displayName: string;
  status: string;
  amount: string;
  currency: string;
  description: string;
}

export interface SubprojectDataWithIntents extends SubprojectData {
  allowedIntents: Intent[];
}

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const subprojects = (await ignoringStreamNotFound(
    multichain.getValues(projectId, subprojectId, 1)
  )) as SubprojectResource[] | null;
  if (subprojects !== null && subprojects.length > 0) {
    const subproject = subprojects[0];
    return subproject.permissions;
  } else {
    return {};
  }
};

export const create = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  permissions: AllowedUserGroupsByIntent,
  logEntry: LogEntry,
  data: {
    displayName: string;
    amount: string;
    currency: string;
    description: string;
  }
): Promise<void> => {
  const resource: SubprojectResource = {
    data: {
      id: subprojectId,
      displayName: data.displayName,
      status: "open",
      amount: data.amount,
      currency: data.currency,
      description: data.description
    },
    log: [logEntry],
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
  const result = await multichain.getValues(projectId, subprojectId, 1);
  if (!result || result.length !== 1) {
    throw { kind: "NotFound", what: { projectId, subprojectId } };
  }
  const resource = result[0] as SubprojectResource;
  return {
    ...resource.data,
    allowedIntents: await getAllowedIntents(token, resource.permissions)
  };
};

export const getAll = async (
  multichain: MultichainClient,
  projectId: string
): Promise<SubprojectResource[]> => {
  const subprojects = (await multichain.getValues(
    projectId,
    SUBPROJECTS_KEY
  )) as SubprojectResource[];
  return subprojects;
};

export const getAllForUser = async (
  multichain: MultichainClient,
  projectId: string,
  token: AuthToken
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
