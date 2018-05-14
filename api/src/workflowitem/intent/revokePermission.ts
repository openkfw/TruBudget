import { changeWorkflowitemPermission } from ".";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";

export const revokeWorkflowitemPermission = async (
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> =>
  changeWorkflowitemPermission(multichain, req, "workflowitem.intent.revokePermission");
