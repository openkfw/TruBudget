import * as Group from ".";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../multichain";

export const getGroupList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const groups = await Group.getAll(multichain);

  return [
    200,
    {
      apiVersion: "1.0",
      data: { groups },
    },
  ];
};
