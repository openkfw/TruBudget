import { changeProjectPermission } from ".";
import { AuthenticatedRequest, HttpResponse } from "../../httpd/lib";
import { MultichainClient } from "../../multichain";

export async function revokeProjectPermission(
  multichain: MultichainClient,
  req: AuthenticatedRequest,
): Promise<HttpResponse> {
  return changeProjectPermission(multichain, req, "project.intent.revokePermission");
}
