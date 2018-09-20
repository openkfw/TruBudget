import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import * as Project from "../model/Project";

export async function getProjectList(multichain: MultichainClient, req): Promise<HttpResponse> {
  const projects = await Project.get(multichain, req.user);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        items: projects,
      },
    },
  ];
}
