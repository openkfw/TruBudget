import { MultichainClient, Resource, LogEntry } from "../Client2.h";
import { AllowedUserGroupsByIntent } from "../../authz/types";

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
  return multichain.updateStreamItem(projectId, [SUBPROJECTS_KEY, subprojectId], resource);
};

export const getAll = async (
  multichain: MultichainClient,
  projectId: string
): Promise<SubprojectResource[]> => {
  const subprojects = (await multichain.latestValuesForKey(
    projectId,
    SUBPROJECTS_KEY
  )) as SubprojectResource[];
  return subprojects;
};
