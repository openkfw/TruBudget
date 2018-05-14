import { changeSubprojectPermission } from ".";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";

export async function grantSubprojectPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeSubprojectPermission(multichain, req, "subproject.intent.grantPermission");
}
