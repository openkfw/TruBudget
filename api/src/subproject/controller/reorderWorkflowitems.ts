import { throwIfUnauthorized } from "../../authz";
import Intent from "../../authz/intents";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { isNonemptyString, value } from "../../lib/validation";
import { MultichainClient } from "../../multichain/Client.h";
import * as Subproject from "../model/Subproject";
import { publishWorkflowitemOrderingUpdate } from "../model/WorkflowitemOrdering";

export async function reorderWorkflowitems(
  multichain: MultichainClient,
  req,
): Promise<HttpResponse> {
  const input = value("data", req.body.data, x => x !== undefined);

  const projectId: string = value("projectId", input.projectId, isNonemptyString);
  const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
  const ordering: string[] = value(
    "ordering",
    input.ordering,
    x => Array.isArray(x) && x.every(isNonemptyString),
  );

  const userIntent: Intent = "subproject.reorderWorkflowitems";
  await throwIfUnauthorized(
    req.user,
    userIntent,
    await Subproject.getPermissions(multichain, projectId, subprojectId),
  );

  publishWorkflowitemOrderingUpdate(multichain, projectId, subprojectId, {
    createdBy: req.user.userId,
    creationTimestamp: new Date(),
    ordering,
  });

  return ok();
}

function ok(): HttpResponse {
  return [200, { apiVersion: "1.0", data: "OK" }];
}
