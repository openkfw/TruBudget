import { changeSubprojectPermission } from ".";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";

export async function revokeSubprojectPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeSubprojectPermission(multichain, req, "subproject.intent.revokePermission");
}
