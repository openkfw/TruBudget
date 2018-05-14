import { throwIfUnauthorized } from "../authz";
import Intent from "../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../httpd/lib";
import { isNonemptyString, value } from "../lib/validation";
import { MultichainClient } from "../multichain";
import * as Project from "../project";
import * as Workflowitem from "../workflowitem";
import { sortWorkflowitems } from "./lib/sortWorkflowitems";
import * as Subproject from "./model/Subproject";

export async function getSubprojectDetails(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const subproject = await Subproject.get(multichain, req.token, projectId, subprojectId);

  const userIntent: Intent = "subproject.viewDetails";

  // Is the user allowed to view subproject details?
  await throwIfUnauthorized(
    req.token,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const workflowitems = await Workflowitem.get(multichain, req.token, projectId, subprojectId).then(
    unsortedItems => sortWorkflowitems(multichain, projectId, subprojectId, unsortedItems),
  );

  const parentProject = await Project.get(multichain, req.token, projectId);

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        subproject,
        workflowitems,
        parentProject: { id: parentProject.id, displayName: parentProject.displayName },
      },
    },
  ];
}
