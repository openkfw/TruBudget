import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { MultichainClient } from "../multichain";
import * as Project from "./model/Project";

export const getProjectList = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> => {
  const projects = await Project.get(multichain, req.token);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        items: projects,
      },
    },
  ];
};
