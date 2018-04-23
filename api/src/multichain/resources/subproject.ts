import { MultichainClient, Resource, LogEntry } from "../Client.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { getAllowedIntents } from "../../authz/index";

/** The multichain-item key used to identify subprojects. */
const SUBPROJECTS_KEY = "subprojects";

export interface SubprojectResource extends Resource {
  data: SubprojectData;
}

export interface SubprojectData {
  id: string;
  displayName: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
}

export interface SubprojectUserView extends SubprojectData {
  allowedIntents: Intent[];
}

export const create = async (
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  permissions: AllowedUserGroupsByIntent,
  logEntry: LogEntry,
  data: {
    displayName: string;
    amount: number;
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
): Promise<SubprojectUserView[]> => {
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
