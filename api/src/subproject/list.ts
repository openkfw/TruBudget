import * as Subproject from ".";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";

export const getSubprojectList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const subprojects: Subproject.SubprojectDataWithIntents[] = await Subproject.getAllForUser(
    multichain,
    req.token,
    projectId,
  );

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        items: subprojects,
      },
    },
  ];
};
