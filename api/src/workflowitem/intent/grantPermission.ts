import { changeWorkflowitemPermission } from ".";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";

export async function grantWorkflowitemPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeWorkflowitemPermission(multichain, req, "workflowitem.intent.grantPermission");
}
