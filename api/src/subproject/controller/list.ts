import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain";
import * as Subproject from "../model/Subproject";

export async function getSubprojectList(multichain: MultichainClient, req): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);

  const subprojects = await Subproject.get(multichain, req.user, projectId);
  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        items: subprojects,
      },
    },
  ];
}
