import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";
import { changeWorkflowitemPermission } from "../intent";

export async function revokeWorkflowitemPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeWorkflowitemPermission(multichain, req, "workflowitem.intent.revokePermission");
}
