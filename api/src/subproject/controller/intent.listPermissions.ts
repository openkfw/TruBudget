import { throwIfUnauthorized } from "../../authz";
import { HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../service/Client.h";
import * as Subproject from "../model/Subproject";

export async function getSubprojectPermissions(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId = value("projectId", input.projectId, isNonemptyString);
  const subprojectId = value("subprojectId", input.subprojectId, isNonemptyString);

  const subprojectPermissions = await Subproject.getPermissions(
    multichain,
    projectId,
    subprojectId,
  );

  // Is the user allowed to list subproject permissions?
  await throwIfUnauthorized(req.user, "subproject.intent.listPermissions", subprojectPermissions);

  return [
    200,
    {
      apiVersion: "1.0",
      data: subprojectPermissions,
    },
  ];
}
