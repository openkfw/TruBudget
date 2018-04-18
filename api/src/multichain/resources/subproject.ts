import { MultichainClient, Resource } from "../Client2.h";

interface SubprojectResource extends Resource {
  data: SubprojectData;
}

interface SubprojectData {}

export const getAll = async (
  multichain: MultichainClient,
  projectId: string
): Promise<SubprojectResource[]> => {
  const streamName = projectId;
  const subprojects = (await multichain.latestValuesForKey(
    streamName,
    "subprojects"
  )) as SubprojectResource[];
  return subprojects;
};
