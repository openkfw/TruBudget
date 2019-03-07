import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import * as Project from "../../project/model/Project";
import { MultichainClient } from "../../service/Client.h";
import * as Workflowitem from "../../workflowitem/model/Workflowitem";
import * as Subproject from "../model/Subproject";
import { fetchWorkflowitemOrdering } from "../model/WorkflowitemOrdering";
import { sortWorkflowitems } from "../sortWorkflowitems";
import * as ProjectGet from "../../service/project_get";
import * as Result from "../../result";
import { ConnToken } from "../../service/conn";
import { Ctx } from "../../lib/ctx";
import { ServiceUser } from "../../service/domain/organization/service_user";

interface WorkflowitemDTO {
  allowedIntents: Intent[];
  data: Workflowitem.Data;
}

function removeEventLog(workflowitem: Workflowitem.WorkflowitemResource): WorkflowitemDTO {
  delete workflowitem.log;
  return workflowitem;
}

export async function getSubprojectDetails(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  req,
): Promise<HttpResponse> {
  const multichain = conn.multichainClient;

  const input = req.query;

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);

  const userIntent: Intent = "subproject.viewDetails";

  // Is the user allowed to view subproject details?
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  const subproject = await Subproject.get(multichain, req.user, projectId, subprojectId).then(
    result => result[0],
  );

  const ordering = await fetchWorkflowitemOrdering(multichain, projectId, subprojectId);

  const workflowitems = await Workflowitem.get(multichain, req.user, projectId, subprojectId)
    .then(unsortedItems => sortWorkflowitems(unsortedItems, ordering))
    .then(sortedItems => sortedItems.map(removeEventLog));

  const project = await ProjectGet.getProject(conn, ctx, issuer, projectId);

  const parentProject = Result.isOk(project)
    ? { id: project.id, displayName: project.displayName }
    : {
        // The callee is not allowed to see the parent project
        id: undefined,
        displayName: undefined,
      };

  return [
    200,
    {
      apiVersion: "1.0",
      data: {
        subproject,
        workflowitems,
        parentProject,
      },
    },
  ];
}
